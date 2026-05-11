# 001 — Haravan → Pancake POS Sync

## Overview

**User story**: As Marketing Performance, tôi muốn hệ thống tự động đẩy dữ liệu doanh số và trạng thái đơn hàng từ Haravan về Pancake POS, để khớp Conversion Value với Ads ID đã có qua Pancake CAPI → tính ROAS chính xác trên Facebook Ads.

**Luồng trigger**:
- `orders/create` → tạo order trên Pancake POS (nếu customer có ads_id)
- `orders/updated` → cập nhật status trên Pancake POS

**Ràng buộc**: Idempotency (không ghi trùng), low latency (queue-based), chỉ sync đơn có Ads ID.

---

## Ads ID Resolution — Cơ chế

**Vấn đề**: Haravan order KHÔNG chứa `conversation_id` hay `ad_ids`. Phải resolve qua phone.

```
haravan.orders.customer_phone
  ↓  match by phone field
pancake.page_customer.phone (VarChar) hoặc phone_numbers (Json)
  [prisma/models/pancake.prisma line 149–151]
  ↓  join by customer_id
pancake.conversation.customer_id → pancake.conversation.ad_ids (Json)
  [prisma/models/pancake.prisma line 4, 21]
```

**SQL pattern** (tham khảo từ `src/services/erp/crm/lead/pancake-lead-sync.js:144–220`):
```sql
SELECT c.id AS conversation_id, c.page_id, c.ad_ids
FROM pancake.conversation c
JOIN pancake.page_customer pc ON c.customer_id = pc.customer_id
WHERE pc.phone = :customer_phone
  AND c.ad_ids IS NOT NULL
  AND c.type = 'INBOX'
ORDER BY c.updated_at DESC
LIMIT 1
```

**Lead filter**: Skip nếu `ad_ids` IS NULL hoặc `ad_ids = []`.

---

## SHOP_ID Resolution — Multi-shop Design

Từ API docs ([`GET /shops`](https://api-docs.pancake.vn/#tag/shop/GET/shops)) response:
```json
{
  "id": 4,
  "name": "...",
  "pages": [
    { "id": "abc123", "platform": "facebook", "shop_id": 4 }
  ]
}
```

Mỗi Pancake **page** thuộc về 1 **shop**. `conversation.page_id` đã có sẵn → resolve chain:

```
conversation.page_id
  ↓
pancake.page.pos_shop_id  (thêm field mới vào model)
  ↓
POST /shops/{pos_shop_id}/orders
```

**Prisma change**: Thêm field vào model `page` hiện tại (`prisma/models/pancake.prisma:116`):
```prisma
pos_shop_id   Int?   // filled by sync job from GET /shops
```

**Sync job** (`src/services/pancake/pos/pancake-pos-shop-sync.ts`):
- Fetch `GET /shops` từ Pancake POS API (auth: `PANCAKE_POS_API_KEY`)
- Iterate `shop.pages[]` → upsert `pancake.page.pos_shop_id = shop.id` WHERE `page.id = pages[].id`

**Schedule**: Thêm vào `src/services/schedule-handler.js` case `"0 17 * * *"` (daily midnight VN), ngay sau `new Pancake.PageSyncService(env).syncPages()` hiện có (line 83):
```js
await new Pancake.PageSyncService(env).syncPages();
await new Pancake.PancakePOSShopSyncService(env).syncShops(); // thêm vào đây
```

**Fallback**: Nếu `pos_shop_id` IS NULL → skip order, log warning.

**Env var cần thêm**: `PANCAKE_POS_API_KEY` (không cần `PANCAKE_POS_SHOP_ID` — dynamic).

---

## Pancake POS API — Key Facts

Nguồn: `https://api-docs.pancake.vn/openapi.json`

- `SHOP_ID`: Integer (path param)
- `ORDER_ID` (response `id`): **Integer** — dùng `Int` trong Prisma
- `status`: **Integer enum**:
  - `0` = New, `1` = Confirmed, `2` = Shipped, `3` = Received
  - `5` = Returned, `6` = Canceled, `15` = Partial return, `20` = Purchased

**Endpoints**:
- `POST /shops/{SHOP_ID}/orders` — tạo order
- `PUT /shops/{SHOP_ID}/orders/{ORDER_ID}` — cập nhật status

**Auth**: API Key từ Pancake Admin → Settings → Advance → Third-party connection.
Env var: `PANCAKE_POS_API_KEY`.

---

## Status Mapping — Haravan → Pancake POS

| Haravan `financial_status` | `fulfillment_status` | Pancake POS `status` (Int) |
|---|---|---|
| `pending` / `authorized` | any | `0` (New) |
| `paid` | `unfulfilled` / `partial` | `1` (Confirmed) |
| `paid` | `fulfilled` | `3` (Received) |
| `cancelled` / `voided` | any | `6` (Canceled) |
| `refunded` | any | `5` (Returned) |
| `partially_refunded` | any | `15` (Partial return) |

---

## Data Mapping — Haravan → Pancake POS POST body

| Pancake POS field | Haravan source | Prisma path |
|---|---|---|
| `bill_phone_number` | SĐT khách | `orders.customer_phone` |
| `bill_full_name` | Tên khách | `orders.customer_first_name` + `last_name` |
| `total_discount` | Giảm giá | `orders.total_discounts` |
| `shipping_fee` | Phí ship | `orders.total_shipping_price_set` |
| `note` | Mã đơn trace | `orders.name` (e.g. `#HRV12345`) |
| `status` | map từ financial + fulfillment | xem bảng trên |
| *(grand total)* | Tổng đơn | `orders.total_price` — gửi qua items |
| *(subtotal)* | Giá SP | `orders.subtotal_price` |

---

## Prisma Schema Changes

### 1. Thêm field vào `pancake.page`

```prisma
// prisma/models/pancake.prisma
model page {
  // ... existing fields ...
  pos_shop_id   Int?   // filled by PancakePOSShopSyncService
}
```

### 2. Tạo tracking table

```prisma
model pancake_pos_order_sync {
  haravan_order_id  BigInt    @id
  pancake_order_id  Int?                      // Integer per API response schema
  shop_id           Int?                      // lưu để dùng khi update
  ads_id            String?   @db.VarChar     // ad_ids[0] để trace ROAS
  status            Int?                      // Pancake POS status integer
  synced_at         DateTime? @db.Timestamp(6)
  created_at        DateTime  @default(now()) @db.Timestamp(6)
  updated_at        DateTime  @default(now()) @db.Timestamp(6)

  @@schema("pancake")
}
```

---

## Files cần tạo (TypeScript)

1. **`src/services/pancake/pos/pancake-pos-shop-sync.ts`**
   - `syncShops()`: fetch `GET /shops`, upsert `pancake.page.pos_shop_id`

2. **`src/services/pancake/pos/pancake-pos-client.ts`**
   - `createOrder(shopId: number, payload: CreateOrderPayload): Promise<PancakePosOrder>`
   - `updateOrderStatus(shopId: number, orderId: number, status: number): Promise<void>`
   - Auth: `PANCAKE_POS_API_KEY` từ env

3. **`src/services/pancake/pos/pancake-pos-sync-service.ts`**
   - `resolveAdsId(db, customerPhone: string): Promise<{ conversationId: string; pageId: string; adIds: string[] } | null>`
   - `resolveShopId(db, pageId: string): Promise<number | null>`
   - `dequeueOrderQueue(batch, env): Promise<void>` — Cloudflare Queue consumer

4. **`src/services/pancake/pos/index.ts`** — re-export

## Files cần sửa (JavaScript)

5. **`src/controllers/webhook/haravan/erp/order.js`** (line 18–27)
   - Thêm: `await ctx.env["PANCAKE_POS_SYNC_QUEUE"].send(data)` cho cả CREATED và UPDATED

6. **`src/services/queue-handler.js`** (line 14+)
   ```js
   case "pancake-pos-sync":
     await Pancake.PancakePOSSyncService.dequeueOrderQueue(batch, env);
     break;
   ```

7. **`src/services/schedule-handler.js`** (line 83)
   - Thêm `await new Pancake.PancakePOSShopSyncService(env).syncShops()` vào case `"0 17 * * *"`

8. **`src/services/pancake/index.js`** — export `PancakePOSSyncService`, `PancakePOSShopSyncService`

9. **`wrangler.jsonc`** — thêm queue binding:
   ```json
   { "queue": "pancake-pos-sync", "binding": "PANCAKE_POS_SYNC_QUEUE" }
   ```

10. **`.dev.vars.example`** — thêm `PANCAKE_POS_API_KEY=`

---

## Luồng xử lý chi tiết

```
Haravan Webhook (orders/create | orders/updated)
  ↓
HaravanERPOrderController.create
  [src/controllers/webhook/haravan/erp/order.js]
  ↓
PANCAKE_POS_SYNC_QUEUE.send({ ...orderData, haravan_topic })
  ↓
PancakePOSSyncService.dequeueOrderQueue
  ↓
  resolveAdsId(customer_phone)
    └─ SQL: page_customer → conversation → { page_id, ad_ids }
    └─ NULL hoặc [] → log + SKIP
  ↓ (có ads_id + page_id)
  resolveShopId(page_id)
    └─ SELECT pos_shop_id FROM pancake.page WHERE id = page_id
    └─ NULL → log warning + SKIP
  ↓ (có shop_id)
  if haravan_topic === "orders/create"
    └─ Check pancake_pos_order_sync (idempotency guard)
    └─ POST /shops/{shop_id}/orders
    └─ Upsert pancake_pos_order_sync { pancake_order_id: Int, shop_id, ads_id, status }
  if haravan_topic === "orders/updated"
    └─ Lookup pancake_order_id + shop_id từ pancake_pos_order_sync
    └─ Không có record → skip
    └─ Map Haravan status → Pancake POS Int status
    └─ PUT /shops/{shop_id}/orders/{pancake_order_id}
    └─ Update pancake_pos_order_sync.status
```

---

## Verification

1. **ads_id filter**: Customer không có Pancake conversation → skip silently
2. **shop_id filter**: Page không có `pos_shop_id` → log warning + skip
3. **Create flow**: Webhook `orders/create` + customer có ads_id → record trong `pancake_pos_order_sync` với `pancake_order_id` (Int)
4. **Idempotency**: Cùng webhook `orders/create` gửi 2 lần → Pancake API chỉ gọi 1 lần
5. **Status update**: Webhook `orders/updated` với `financial_status=refunded` → Pancake POS status = `5`
6. **Shop sync**: `syncShops()` chạy → `pancake.page.pos_shop_id` được fill đúng per shop

---

## Key file references

| File | Dòng | Vai trò |
|---|---|---|
| `src/controllers/webhook/haravan/erp/order.js` | 18–27 | Webhook entry, thêm queue dispatch |
| `src/services/queue-handler.js` | 14+ | Queue switch-case |
| `src/services/schedule-handler.js` | 83 | Cron case `0 17 * * *` |
| `src/services/erp/crm/lead/pancake-lead-sync.js` | 144–220 | SQL pattern resolve ad_ids |
| `prisma/models/pancake.prisma` | 1–30, 116–134, 136–157 | conversation, page, page_customer schema |
| `prisma/models/haravan.prisma` | 246, 320, 326 | customer_phone, subtotal_price, total_price |
| `src/services/ecommerce/enum.js` | 1–6 | HARAVAN_TOPIC constants |
| `wrangler.jsonc` | 369+ | Queue + cron triggers |
