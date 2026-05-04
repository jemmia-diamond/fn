# Config Translator Service - Workflow Documentation

## Tổng quan

Service tự động dịch config Haravan (`config/settings_data.json`) từ tiếng Việt sang tiếng Anh, chạy lúc **21:00 hàng ngày** (giờ Việt Nam).

---

## Kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare Worker (Cron)                     │
│                                                                 │
│  21:00 VN time (0 14 * * * UTC)                                 │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           ConfigTranslatorService.sync()                │   │
│  │                                                         │   │
│  │  1. GET config từ Haravan API                           │   │
│  │  2. Lấy snapshot cũ từ KV                               │   │
│  │  3. So sánh & filter key thay đổi                       │   │
│  │  4. Dịch text + ảnh (VI → EN)                           │   │
│  │  5. PUT config đã dịch lên Haravan                      │   │
│  │  6. Lưu snapshot mới vào KV                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  External Services:                                             │
│  ├─ Haravan API (GET/PUT assets)                               │
│  ├─ Cloudflare KV (snapshot storage)                           │
│  ├─ AI Proxy → Gemini 2.5 Flash Lite (text translation)        │
│  └─ Gemini 3.1 Flash Image (image translation)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## File liên quan

| File | Mô tả |
|------|-------|
| `src/services/haravan/config-translator/config-sync-service.js` | Service chính xử lý toàn bộ workflow |
| `src/services/haravan/config-translator/index.js` | Export module |
| `src/services/haravan/index.js` | Export `ConfigTranslator` từ haravan module |
| `src/services/schedule-handler.js` | Đăng ký cron job (case `"0 14 * * *"`) |
| `src/constants/ai-proxy.js` | Định nghĩa AI models & translation prompts |
| `src/services/media/image-translation-service.js` | Service dịch ảnh (tái sử dụng) |
| `src/services/utils/llm-helper.js` | Helper tạo AI model instances |
| `src/services/utils/retry-utils.js` | Retry mechanism cho API calls |
| `src/services/utils/sleep.js` | Utility delay giữa các batch |

---

## Workflow chi tiết 7 bước

### Bước 1: GET config từ Haravan API

```
GET https://apis.haravan.com/web/themes/{theme_id}/assets.json
    ?asset[key]=config/settings_data.json

Headers:
  Authorization: Bearer {HARAVAN_TOKEN}
```

- Theme ID: `1001480728`
- Token lấy từ Secrets Store: `HARAVAN_TOKEN_SECRET`
- Response trả về `asset.value` là JSON string của config

### Bước 2: Lấy snapshot cũ từ KV

```js
const previousConfig = await env.FN_KV.get("haravan_config_snapshot", "json");
```

- KV Namespace: `FN_KV`
- Key: `haravan_config_snapshot`
- Lần đầu chạy → `previousConfig = null`

### Bước 3: So sánh & filter key thay đổi

```js
const { allKeys, changedPaths } = findChangedKeys(currentConfig, previousConfig);
```

**Logic so sánh:**

| Trường hợp | `allKeys` | `changedPaths` | Hành động |
|------------|-----------|----------------|-----------|
| Lần đầu chạy (chưa có snapshot) | `true` | `[]` | Dịch toàn bộ config |
| Không có thay đổi | `false` | `[]` | Bỏ qua, không làm gì |
| Có thay đổi | `false` | `["path.to.key", ...]` | Chỉ dịch các key thay đổi |

**Thuật toán `findChangedKeys`:**
- Duyệt đệ quy toàn bộ nested object
- So sánh từng value (string, number, object)
- Ghi nhận path của key bị thay đổi (vd: `"settings.header.title"`)
- Phát hiện: key mới, key bị xóa, thay đổi type, thay đổi value

### Bước 4: Dịch text + ảnh (VI → EN)

```js
const translatedConfig = await applyTranslations(currentConfig, changedPaths, allKeys, imageService);
```

#### 4.1 Phân loại value

```
String value
    │
    ├── isImageUrl()? ──YES──► translateImageUrl()
    │                           │
    │                           └── ImageTranslationService.translateImage()
    │                               ├── Fetch ảnh từ URL
    │                               ├── AI Gemini 3.1 Flash: Extract text + position + style
    │                               ├── AI Gemini 3.1 Flash Image: Generate ảnh mới với text EN
    │                               ├── Upload lên R2 (assets.jemmia.vn)
    │                               └── Trả về URL ảnh mới
    │
    ├── contains HTML tags? ──YES──► translateHtml()
    │                                 │
    │                                 └── AI Gemini 2.5 Flash Lite
    │                                     ├── Prompt: TRANSLATION_PROMPTS.HTML
    │                                     ├── Giữ nguyên HTML structure
    │                                     └── Chỉ dịch text visible
    │
    └── else ──► translateText()
                  │
                  └── AI Gemini 2.5 Flash Lite
                      ├── Prompt: TRANSLATION_PROMPTS.TEXT
                      └── Trả về text đã dịch
```

#### 4.2 Điều kiện dịch

Value chỉ được dịch khi thỏa **TẤT CẢ**:

1. Là string
2. Có chứa ký tự tiếng Việt có dấu (regex: `[àáạảãâ...đÀÁẠẢÃ...Đ]`)
3. Path nằm trong `changedPaths` (hoặc `allKeys=true`)

#### 4.3 Execution strategy

```
collectTranslations() → duyệt đệ quy config
    │
    └── Collect các task cần dịch vào translationTasks[]
         │
         └── Chạy batch (TRANSLATION_CONCURRENCY = 3):
              │
              ├── Batch 1: Promise.all([task1, task2, task3])
              ├── sleep(500ms)
              ├── Batch 2: Promise.all([task4, task5, task6])
              ├── sleep(500ms)
              └── ...
```

#### 4.4 Retry mechanism

Tất cả AI calls & API calls đều được bọc bởi `retryQuery()`:

- **Max retries:** 3
- **Backoff:** Exponential (1s → 2s → 4s)
- **Retry trên errors:** 400, 429, 500, 502, 503, timeout, handshake

### Bước 5: PUT config đã dịch lên Haravan

```
PUT https://apis.haravan.com/web/themes/{theme_id}/assets.json

Headers:
  Authorization: Bearer {HARAVAN_TOKEN}
  Content-Type: application/json

Body:
{
  "asset": {
    "key": "config/settings_data.json",
    "value": "{translated JSON string}"
  }
}
```

### Bước 6: Lưu snapshot mới vào KV

```js
await env.FN_KV.put("haravan_config_snapshot", JSON.stringify(currentConfig));
```

- Lưu **bản gốc tiếng Việt** (trước khi dịch) làm snapshot
- Dùng để so sánh cho lần chạy tiếp theo

---

## AI Models & Prompts

### Text Translation

| Property | Value |
|----------|-------|
| Model | `gemini-2.5-flash-lite` |
| Provider | AI Proxy (`aiproxy.jemmia.vn`) |
| Auth | `AI_PROXY_TOKEN_SECRET` |

**Prompts:**

```js
// Dịch HTML
TRANSLATION_PROMPTS.HTML = `
  Translate the following HTML content from Vietnamese to English.
  Requirements:
    - Keep the entire HTML structure unchanged (tags, attributes, formatting, indentation)
    - Only translate visible Vietnamese text content into English
    - Do NOT modify tag names, attribute names, attribute values, class names, IDs,
      inline styles, scripts, or URLs
    - Do NOT add, remove, or reorder any elements
    - Preserve special characters, entities, and whitespace
    - If text is already in English, keep it as is
    - Return ONLY the final translated HTML
`

// Dịch text thường
TRANSLATION_PROMPTS.TEXT = `
  Translate the following title from Vietnamese to English.
  Return ONLY the translated text.
`
```

### Image Translation

| Property | Value |
|----------|-------|
| Extraction Model | `gemini-3.1-flash-lite-preview` |
| Generation Model | `gemini-3.1-flash-image-preview` |
| Provider | Google Generative AI API |
| Auth | `GEMINI_API_KEY_SECRET` |
| Storage | R2 bucket (`assets.jemmia.vn`) |

**Image translation flow:**

```
1. Fetch image from URL
2. Compute SHA-256 hash → check if already translated (cache)
3. Extract metadata (text, position, style) via AI
4. Generate new image with translated text via AI
5. Upload to R2 with naming: en_{original}_{hash}.{ext}
6. Return public URL
```

---

## Configuration

```js
ConfigTranslatorService.CONFIG = {
  THEME_ID: "1001480728",           // Haravan theme ID
  KV_KEY: "haravan_config_snapshot", // KV storage key
  API_REQUEST_DELAY: 500,           // Delay giữa các batch (ms)
  TRANSLATION_CONCURRENCY: 3        // Số task chạy song song mỗi batch
}
```

---

## Cron Schedule

Đăng ký trong `schedule-handler.js`:

```js
case "0 14 * * *": // 21:00 VN time (UTC+7)
  await ERP.Automation.AssignmentRuleService.enableAssignmentRuleOffHour(env);
  await new Haravan.Articles.ArticleSyncService(env).sync();
  await new Haravan.ConfigTranslator.ConfigTranslatorService(env).sync(); // ← Mới thêm
  break;
```

Cron expression `0 14 * * *` = 14:00 UTC = 21:00 VN time.

---

## Error Handling

- Tất cả errors được capture qua `Sentry.captureException()`
- Image translation failures → fallback giữ nguyên URL gốc
- Parse errors (invalid JSON) → early exit, không crash
- KV read errors → coi như first run (dịch toàn bộ)

---

## Flow Diagram

```
                    ┌─────────────────────┐
                    │   Cron: 21:00 daily │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  GET Haravan Config │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Parse JSON config  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  GET KV Snapshot    │◄───────┐
                    └──────────┬──────────┘        │
                               │                   │
                               ▼                   │
                    ┌─────────────────────┐        │
                    │  Compare & Diff     │        │
                    │  findChangedKeys()  │        │
                    └──────────┬──────────┘        │
                               │                   │
                    ┌──────────┴──────────┐        │
                    │                     │        │
                    ▼                     ▼        │
            No changes?            Has changes?    │
                    │                     │        │
                    │ YES                 │ NO     │
                    ▼                     ▼        │
               EXIT ───┐      ┌───────────────────┘
                       │      │
                       │      ▼
                       │  ┌─────────────────────┐
                       │  │  Collect translation│
                       │  │  tasks (VI text/img)│
                       │  └──────────┬──────────┘
                       │             │
                       │             ▼
                       │  ┌─────────────────────┐
                       │  │  Execute in batches │
                       │  │  (3 concurrent)     │
                       │  │  + sleep(500ms)     │
                       │  └──────────┬──────────┘
                       │             │
                       │             ▼
                       │  ┌─────────────────────┐
                       │  │  PUT Haravan Config │
                       │  └──────────┬──────────┘
                       │             │
                       │             ▼
                       │  ┌─────────────────────┐
                       └─►│  Save KV Snapshot   │
                          └─────────────────────┘
```

---

## Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `@ai-sdk/google` | ^3.0.59 | Google Generative AI provider |
| `@ai-sdk/openai-compatible` | ^2.0.37 | AI Proxy provider |
| `ai` | ^6.0.142 | AI SDK (generateText, generateImage) |
| `@sentry/cloudflare` | ^10.19.0 | Error tracking |
