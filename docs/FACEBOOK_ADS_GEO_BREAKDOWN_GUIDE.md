# Facebook Ads Geographic Breakdown - Hướng dẫn đúng

## ❌ LỖI PHỔ BIẾN

**KHÔNG được** kết hợp cả 3 breakdowns cùng lúc:

```javascript
// ❌ SAI - Sẽ báo lỗi 100
breakdowns: ['country', 'region', 'dma']
// Error: (Bad request - please check your parameters)
// (#100) Current combination of data breakdown columns 
// (action_type, country, dma, region) is invalid
```

---

## ✅ CÁCH ĐÚNG

Facebook chỉ cho phép các combinations sau:

### 1. Breakdown by Country only

```javascript
const params = {
  level: 'ad',
  breakdowns: ['country'],
  time_range: { since: '2026-02-01', until: '2026-02-05' },
  time_increment: 1,
  fields: [
    'ad_id', 'ad_name', 'campaign_id', 'campaign_name',
    'adset_id', 'adset_name', 'date_start',
    'country',  // ← breakdown dimension
    'spend', 'impressions', 'clicks', 'reach',
    'cpc', 'cpm', 'actions'
  ]
};
```

**Response:**
```json
{
  "ad_id": "123",
  "date_start": "2026-02-01",
  "country": "VN",
  "spend": "1500.00",
  "impressions": "50000"
}
```

**Insert vào DB:**
```javascript
{
  ad_id: "123",
  date: new Date("2026-02-01"),
  country: "VN",
  region: null,
  dma: null,
  spend: 1500.00,
  impressions: 50000
}
```

---

### 2. Breakdown by Country + Region

```javascript
const params = {
  level: 'ad',
  breakdowns: ['country', 'region'],  // ← 2 breakdowns
  time_range: { since: '2026-02-01', until: '2026-02-05' },
  time_increment: 1,
  fields: [
    'ad_id', 'ad_name', 'campaign_id', 'campaign_name',
    'adset_id', 'adset_name', 'date_start',
    'country', 'region',  // ← breakdown dimensions
    'spend', 'impressions', 'clicks', 'reach',
    'cpc', 'cpm', 'actions'
  ]
};
```

**Response:**
```json
{
  "ad_id": "123",
  "date_start": "2026-02-01",
  "country": "US",
  "region": "California",
  "spend": "2500.00",
  "impressions": "75000"
}
```

**Insert vào DB:**
```javascript
{
  ad_id: "123",
  date: new Date("2026-02-01"),
  country: "US",
  region: "California",
  dma: null,
  spend: 2500.00,
  impressions: 75000
}
```

---

### 3. Breakdown by DMA (chỉ US)

```javascript
const params = {
  level: 'ad',
  breakdowns: ['dma'],  // ← chỉ DMA
  time_range: { since: '2026-02-01', until: '2026-02-05' },
  time_increment: 1,
  fields: [
    'ad_id', 'ad_name', 'campaign_id', 'campaign_name',
    'adset_id', 'adset_name', 'date_start',
    'dma',  // ← breakdown dimension
    'spend', 'impressions', 'clicks', 'reach',
    'cpc', 'cpm', 'actions'
  ]
};
```

**Response:**
```json
{
  "ad_id": "123",
  "date_start": "2026-02-01",
  "dma": "807",  // San Francisco Bay Area
  "spend": "3000.00",
  "impressions": "100000"
}
```

**Insert vào DB:**
```javascript
{
  ad_id: "123",
  date: new Date("2026-02-01"),
  country: null,
  region: null,
  dma: "807",
  spend: 3000.00,
  impressions: 100000
}
```

---

## 📊 DMA Codes phổ biến

| DMA Code | Market Name |
|----------|-------------|
| 501 | New York, NY |
| 803 | Los Angeles, CA |
| 602 | Chicago, IL |
| 623 | Dallas-Fort Worth, TX |
| 807 | San Francisco-Oakland-San Jose, CA |
| 539 | Tampa-St. Petersburg (Sarasota), FL |
| 524 | Atlanta, GA |
| 618 | Houston, TX |

Xem danh sách đầy đủ: https://www.tvb.org/Public/Research/Measurement/DMACodes.aspx

---

## 🎯 Khuyến nghị triển khai

### Nếu muốn cả 3 loại breakdown:

Gọi API **3 lần riêng biệt** và lưu vào cùng bảng `facebook_ads_insights_geo`:

```javascript
async function syncGeoBreakdowns(adId, dateStart, dateEnd) {
  // 1. Country only
  await syncGeoBreakdown(adId, dateStart, dateEnd, ['country']);
  
  // 2. Country + Region
  await syncGeoBreakdown(adId, dateStart, dateEnd, ['country', 'region']);
  
  // 3. DMA
  await syncGeoBreakdown(adId, dateStart, dateEnd, ['dma']);
}

async function syncGeoBreakdown(adId, dateStart, dateEnd, breakdowns) {
  const params = {
    level: 'ad',
    breakdowns: breakdowns,
    time_range: { since: dateStart, until: dateEnd },
    time_increment: 1,
    fields: [
      'ad_id', 'ad_name', 'campaign_id', 'campaign_name',
      'adset_id', 'adset_name', 'date_start',
      ...breakdowns,  // dynamic breakdown fields
      'spend', 'impressions', 'clicks', 'reach',
      'cpc', 'cpm', 'actions'
    ]
  };
  
  const ad = new Ad(adId);
  const insights = await ad.getInsights([], params);
  
  for (const item of insights) {
    await prisma.marketingFacebookAdsInsightsGeo.upsert({
      where: {
        unique_ad_geo: {
          ad_id: item.ad_id,
          date: new Date(item.date_start),
          country: item.country || null,
          region: item.region || null,
          dma: item.dma || null
        }
      },
      create: {
        ad_id: item.ad_id,
        date: new Date(item.date_start),
        country: item.country || null,
        region: item.region || null,
        dma: item.dma || null,
        spend: item.spend ? new Decimal(item.spend) : null,
        impressions: item.impressions ? BigInt(item.impressions) : null,
        // ... other metrics
      },
      update: { /* same as create */ }
    });
  }
}
```

---

## ⚠️ Lưu ý quan trọng

1. **Unique constraint**: Trong Prisma schema, unique key phải bao gồm cả 3 fields (country, region, dma) vì:
   - Khi breakdown=['country']: `country='VN', region=null, dma=null`
   - Khi breakdown=['country','region']: `country='US', region='California', dma=null`
   - Khi breakdown=['dma']: `country=null, region=null, dma='807'`
   - Mỗi combination tạo unique record

2. **Query data**: Khi query, filter theo breakdown type:
   ```sql
   -- Chỉ country
   SELECT * FROM facebook_ads_insights_geo 
   WHERE country IS NOT NULL AND region IS NULL AND dma IS NULL;
   
   -- Country + Region
   SELECT * FROM facebook_ads_insights_geo 
   WHERE country IS NOT NULL AND region IS NOT NULL AND dma IS NULL;
   
   -- DMA only
   SELECT * FROM facebook_ads_insights_geo 
   WHERE country IS NULL AND region IS NULL AND dma IS NOT NULL;
   ```

3. **Data volume**: Nếu bạn sync cả 3 loại, data sẽ lớn gấp 3. Cân nhắc:
   - Chỉ sync breakdown cần thiết
   - Hoặc sync theo schedule khác nhau (country daily, region weekly, dma monthly)
