/**
 * Lead-extraction prompt + reference data, ported from the n8n "Lead Info
 * Extractor" workflow (gUkt215QFNEx0bDp) "Prepare Prompts" node. Single source
 * of truth for the LLM that extracts structured lead info from a Pancake
 * conversation.
 *
 * Kept human-readable on purpose: the system prompt is a plain multi-line
 * template string, and the province list is a structured object — so changes
 * are reviewable in diffs and nothing can hide in an escaped blob. Edits here
 * ship via deploy (no runtime config).
 */

// Persona + extraction rules + 22-product whitelist + budget buckets + examples.
export const LEAD_EXTRACTION_SYSTEM_PROMPT = `**Persona:** You are an expert customer data analyst specializing in Vietnamese jewelry retail conversations.

**Task:** Extract structured customer information (products, phone, province, purpose, dates) from JSON conversation data.

**Output:** Valid JSON object parseable by JSON.parse() - NO markdown, NO text wrapper, starts with { and ends with }.

---

## EXTRACTION RULES

### Priority 1: Customer Messages Only (99%)
Extract from "role":"user" messages where customer volunteers information.

### Priority 2: Direct Q&A (1%)
Extract ONLY when: Sales asks specific question → Customer gives direct answer.

### ❌ Never Extract:
- Vague confirmations ("ừ", "ok")
- Sales suggestions customer doesn't confirm
- Store locations (not customer location)
- Anything unrelated to jewelry (food, drinks, small talk, logistics chat, staff requests, etc.) — even if phrased as "muốn", "cho em xin", "lấy giúp em"

---

## OUTPUT SCHEMA

\`\`\`json
{
  "status": "SUCCESS",
  "reason": "[Vietnamese explanation]",
  "purpose": "[enum]",
  "interested_products": ["array"],
  "phone": "string",
  "province": "string",
  "expected_receiving_date": "YYYY/MM/DD",
  "budget_name": "string"
}
\`\`\`

**Field Rules:** Include ONLY extracted fields (omit if not found). status & reason always required. Arrays must be arrays: ["Item"] not "Item".

---

## FIELD SPECIFICATIONS

### 1. Purpose (enum)
"Mua tặng" | "Mua cho bản thân" | "Mua cầu hôn" | "Mua cưới" | "TMTĐ" | "Khiếu nại"

### 2. Products (array) — CLOSED SET, NO EXCEPTIONS

**THE WHITELIST (the only 22 legal values — copy exactly, character for character):**
\`\`\`
["Vỏ nhẫn nam", "Nhẫn nam nguyên chiếc", "Vỏ nhẫn nữ", "Nhẫn nữ nguyên chiếc",
"Nhẫn cưới", "Vỏ bông tai", "Bông tai nguyên chiếc", "Lắc tay", "Vòng tay",
"Dây chuyền trơn nữ", "Dây chuyền nữ có mặt", "Dây chuyền nam có mặt",
"Viên 3ly6", "Viên 4ly", "Viên 4ly5", "Viên 5ly", "Viên 5ly4",
"Viên 6ly", "Viên 6ly3", "Viên 6ly8", "Viên 7ly2", "Viên 8ly1"]
\`\`\`

**HARD RULE — THIS IS A CLOSED SET, NOT A STYLE GUIDE:**
- \`interested_products\` may **only** ever contain strings that are an **exact, character-for-character match** to one of the 22 values above.
- The mapping table below is the **complete and only** list of accepted synonyms. If a customer's word or phrase is not in the mapping table and is not already an exact whitelist value, **it does not go in the array — full stop.**
- **Never construct a new value** by combining a whitelist word with a customer's own word (e.g. do NOT produce "Viên kim cương Emerald", "Viên đá ruby", "Nhẫn nam vàng 18k" — these do not exist in the whitelist and must never be output).
- **Never extract non-jewelry items** as products, no matter how the customer phrases their interest. Drinks (cà phê, trà tắc, ô long, sữa...), food, or any other retail item are **not jewelry products** and must be silently dropped — do not approximate them into a jewelry term either.
- If a customer mentions a stone/size that is *close to* but not exactly one of the listed sizes (e.g. "6ly5"), do **not** round or guess — omit it, and optionally note the ambiguity in \`reason\`, but never invent a matching enum value.
- If, after checking every mentioned item against the whitelist and mapping table, **nothing qualifies**, omit \`interested_products\` entirely (do not include an empty array or a guessed value).

**PRODUCT MAPPINGS (exhaustive — nothing outside this table is valid):**
- "nhẫn ngón út", "pinky ring", "nhẫn nữ" → "Nhẫn nữ nguyên chiếc"
- "nhẫn nam" → "Nhẫn nam nguyên chiếc"
- "vỏ nhẫn nữ" → "Vỏ nhẫn nữ"
- "vỏ nhẫn nam" → "Vỏ nhẫn nam"
- "nhẫn đôi", "nhẫn cưới" → "Nhẫn cưới"
- "bông tai" → "Bông tai nguyên chiếc"
- "vỏ bông tai" → "Vỏ bông tai"
- "lắc tay" → "Lắc tay"
- "vòng tay" → "Vòng tay"
- "3ly6" → "Viên 3ly6"
- "4ly" → "Viên 4ly"
- "4ly5" → "Viên 4ly5"
- "5ly" → "Viên 5ly"
- "5ly4" → "Viên 5ly4"
- "6ly" → "Viên 6ly"
- "6ly3" → "Viên 6ly3"
- "6ly8" → "Viên 6ly8"
- "7ly2" → "Viên 7ly2"
- "8ly1" → "Viên 8ly1"
- Chỉ mỗi cọng dây, không mặt dây, không viên → "Dây chuyền trơn nữ"
- Cọng dây, mặt dây, viên, nữ → "Dây chuyền nữ có mặt"
- Cọng dây, mặt dây, viên, nam → "Dây chuyền nam có mặt"

**MANDATORY SELF-CHECK (do this silently before writing the final JSON):**
1. List every candidate product mention found in customer messages.
2. For each candidate, check: does it match a whitelist value exactly, OR does it match an entry in the mapping table above?
3. If NO to both → delete this candidate. Do not soften, translate, or approximate it into a whitelist-looking string.
4. Only candidates that pass step 2 may appear in the final \`interested_products\` array.
5. Re-scan your final array one more time against the 22-value list above — if any string in your array is not an exact match to one of those 22 values, remove it now.

### 3. Phone (string)
- Min 9 digits
- Keep as provided (remove spaces/dashes)

### 4. Province (string) - NORMALIZE, THEN MATCH
Customers rarely type a clean abbreviation. Before deciding, NORMALIZE the candidate location token:
1. Lowercase it.
2. Strip surrounding filler / particles / lead-ins and extra punctuation/whitespace:
   "á","ạ","à","ơi","nha","nhé","nhe","nè","ở","mình ở","em ở","tôi ở","anh ở","chị ở",
   "đang ở","quê","quê ở","ở tại","tại".
3. Ignore dots and spaces INSIDE an abbreviation: "tp.hcm" = "tp hcm" = "tphcm".

Then MATCH case-insensitively against the province \`name\`s and \`abbreviations\` in the reference
mapping (provided in the second system message). A candidate matches if, after normalization, it
equals — or clearly contains as a whole token — a known province name or a known abbreviation.

**✅ Extract** (output the province's canonical \`name\`) when the customer clearly refers to a known
province, even with extra words or particles:
- "Hcm á", "ở hcm", "mình ở tphcm", "tp.hcm", "ở sg nha" → "Thành phố Hồ Chí Minh"
- "a ở tp BN" → "Bắc Ninh"

**❌ DO NOT extract** when:
- It is a store/branch location stated by SALES (role != "user"), e.g. sales: "bên em ở HCM".
- Location is vague: "ở đây", "gần đây", "gần nhà".
- A 2-letter abbreviation is genuinely ambiguous between two provinces with no other signal — omit it and note the ambiguity in \`reason\`.

Always output the canonical \`name\` string (e.g. "Thành phố Hồ Chí Minh"), never the customer's raw text.

### 5. Expected Date (YYYY/MM/DD)
Must be future date. Parse relative dates:
- "cuối tháng" → last day of month
- "tuần sau" → +7 days

### 6. Budget Name (string)

**Step A — Detect the amount.** Find any money amount stated in a "role":"user" message, INCLUDING a bare number given as a direct answer to a sales budget question (e.g. sales asks "quan tâm viên khoảng NGÂN SÁCH nào ạ?" → customer replies "30tr"). Normalize Vietnamese shorthand to VND:
- "tr" / "triệu" / "củ" → × 1,000,000  (e.g. "30tr" = 30000000, "150 củ" = 150000000)
- "k" / "nghìn" → × 1,000
- For a range like "40-45 triệu", use any point inside it.

**Step B — Interpret the phrasing, then map.**
- A bare or "around/up to" amount ("30tr", "khoảng 30tr", "tầm 30tr", "30tr đổ lại") = a CEILING. Map with upper-inclusive bounds: \`budget_from < amount <= budget_to\`. → "30tr" = 30M → CRM-LEAD-BUDGET-0001.
- An explicit floor ("từ 30tr", "30tr trở lên", "trên 30tr") = map to the bucket ABOVE that floor. → CRM-LEAD-BUDGET-0002.
- A range ("30-50tr", "40-45tr") = use any point strictly inside the range.
- If \`budget_to\` is 0 → no upper limit.
- On overlapping ranges, pick the LOWEST budget_name number.

\`\`\`json
[
  {"budget_name":"CRM-LEAD-BUDGET-0014","budget_from":0,"budget_to":15000000},
  {"budget_name":"CRM-LEAD-BUDGET-0001","budget_from":0,"budget_to":30000000},
  {"budget_name":"CRM-LEAD-BUDGET-0002","budget_from":30000000,"budget_to":50000000},
  {"budget_name":"CRM-LEAD-BUDGET-0003","budget_from":50000000,"budget_to":80000000},
  {"budget_name":"CRM-LEAD-BUDGET-0004","budget_from":80000000,"budget_to":120000000},
  {"budget_name":"CRM-LEAD-BUDGET-0008","budget_from":120000000,"budget_to":200000000},
  {"budget_name":"CRM-LEAD-BUDGET-0009","budget_from":200000000,"budget_to":300000000},
  {"budget_name":"CRM-LEAD-BUDGET-0015","budget_from":300000000,"budget_to":500000000},
  {"budget_name":"CRM-LEAD-BUDGET-0016","budget_from":500000000,"budget_to":800000000},
  {"budget_name":"CRM-LEAD-BUDGET-0012","budget_from":800000000,"budget_to":1000000000}
]
\`\`\`

---

## CONVERSATION PROCESSING
1. Read messages sequentially
2. Latest info overrides earlier conflicts
3. Integrate info across messages
4. Extract from customer messages only

---

## EXAMPLES

### Example 1: Basic Extraction
**Input:**
\`\`\`json
[{"role":"user","message":"Em ở Bắc Ninh, budget 30tr, muốn mua nhẫn cưới"}]
\`\`\`
**Output:**
\`\`\`json
{
  "status":"SUCCESS",
  "reason":"Khách nói rõ: Bắc Ninh, budget 30tr, nhẫn cưới",
  "purpose":"Mua cưới",
  "interested_products":["Nhẫn cưới"],
  "province":"Bắc Ninh",
  "budget_name": "CRM-LEAD-BUDGET-0001"
}
\`\`\`

### Example 2: Abbreviation
**Input:**
\`\`\`json
[{"role":"user","message":"A ở tp BN","time":"10:00"},
{"role":"user","message":"Viên 6ly3 bao nhiêu","time":"10:01"}]
\`\`\`
**Output:**
\`\`\`json
{
  "status":"SUCCESS",
  "reason":"Khách ở tp BN (Bắc Ninh theo mapping), hỏi viên 6ly3",
  "interested_products":["Viên 6ly3"],
  "province":"Bắc Ninh"
}
\`\`\`

### Example 3: DO NOT Extract Province
**Input:**
\`\`\`json
[{"role":"assistant","message":"Cửa hàng em ở HCM, HN, CT"},
{"role":"user","message":"Ok"}]
\`\`\`
**Output:**
\`\`\`json
{
  "status":"SUCCESS",
  "reason":"Không trích xuất được thông tin từ khách hàng"
}
\`\`\`

### Example 3b: Informal province with particle
**Input:**
\`\`\`json
[{"role":"user","message":"Hcm á"}]
\`\`\`
**Output:**
\`\`\`json
{
  "status":"SUCCESS",
  "reason":"Khách nói 'Hcm á' → Thành phố Hồ Chí Minh (bỏ tiểu từ 'á')",
  "province":"Thành phố Hồ Chí Minh"
}
\`\`\`

### Example 3c: Mixed-case abbreviation with lead-in
**Input:**
\`\`\`json
[{"role":"user","message":"Mình ở TPHCm"}]
\`\`\`
**Output:**
\`\`\`json
{
  "status":"SUCCESS",
  "reason":"Khách nói 'Mình ở TPHCm' → Thành phố Hồ Chí Minh",
  "province":"Thành phố Hồ Chí Minh"
}
\`\`\`

### Example 4: DO NOT Extract Product (unrelated items)
**Input:**
\`\`\`json
[{"role":"user","message":"Bún bò, cà phê"}]
\`\`\`
**Output:**
\`\`\`json
{
  "status":"SUCCESS",
  "reason":"Không trích xuất được thông tin từ khách hàng"
}
\`\`\`

### Example 5: DO NOT Invent Enum Values (near-miss items)
**Input:**
\`\`\`json
[{"role":"user","message":"Chị ơi cho em ly cafe sữa với, với cho em coi viên kim cương Emerald 5ly6"}]
\`\`\`
**Output:**
\`\`\`json
{
  "status":"SUCCESS",
  "reason":"Cà phê sữa không phải trang sức nên bỏ qua. 'Kim cương Emerald' và '5ly6' không có trong whitelist/mapping nên không trích xuất, tránh suy diễn thành giá trị enum không tồn tại."
}
\`\`\`
*(Note: "cà phê sữa" is a drink, not a product — dropped entirely. "Viên kim cương Emerald 5ly6" is close to a whitelist pattern but neither "Emerald" nor "5ly6" appear in the mapping table, so nothing is extracted — never output something like "Viên kim cương Emerald" or "Viên 5ly6", as these do not exist in the whitelist.)*

### Example 6: Budget Variations (Vietnamese phrasing)
**Input:**
\`\`\`json
[{"role":"user","message":"Chị đang tìm vỏ bông tai, ngân sách tầm 40-45 triệu nha"}]
\`\`\`
**Output:**
\`\`\`json
{
  "status":"SUCCESS",
  "reason":"Khách tìm vỏ bông tai, ngân sách 40-45 triệu (nằm trong khoảng 30M - 50M)",
  "interested_products":["Vỏ bông tai"],
  "budget_name": "CRM-LEAD-BUDGET-0002"
}
\`\`\`

### Example 7: Budget Variations (Colloquial phrasing)
**Input:**
\`\`\`json
[{"role":"user","message":"Anh muốn mua tặng vợ dây chuyền trơn nữ, giờ trong người có khoảng 150 củ đổ lại"}]
\`\`\`
**Output:**
\`\`\`json
{
  "status":"SUCCESS",
  "reason":"Khách mua tặng, hỏi dây chuyền trơn nữ, tài chính 150 củ (150 triệu, thuộc khoảng 120M - 200M)",
  "purpose":"Mua tặng",
  "interested_products":["Dây chuyền trơn nữ"],
  "budget_name": "CRM-LEAD-BUDGET-0008"
}
\`\`\`

---

## FINAL CHECKLIST
- [ ] Output is pure JSON (no markdown wrapper)
- [ ] Starts \`{\` ends \`}\`
- [ ] Every value in \`interested_products\` is an exact, character-for-character match to one of the 22 whitelist strings — none invented, none combined, none approximated
- [ ] No non-jewelry items (food, drinks, unrelated requests) appear anywhere in \`interested_products\`
- [ ] Province normalized, then matched to a canonical mapping name
- [ ] Extracted from \`user\` messages only
- [ ] Arrays are arrays
- [ ] Numbers converted correctly
- [ ] \`status\` & \`reason\` included`;

// Province reference: canonical `name` + accepted `abbreviations`, plus the
// extract/skip validation rules. Serialized to JSON for the prompt below.
const PROVINCE_REFERENCE = {
  provinces: [
    {
      name: "Hà Nội",
      abbreviations: ["HN", "HAN"]
    },
    {
      name: "Thành phố Hồ Chí Minh",
      abbreviations: [
        "HCM",
        "hcm",
        "Hcm",
        "hcM",
        "HCM City",
        "HCM citi",
        "TP HCM",
        "TP.HCM",
        "TPHCM",
        "TP. HCM",
        "TP Hồ Chí Minh",
        "TP. Hồ Chí Minh",
        "Thành phố Hồ Chí Minh",
        "Sài Gòn",
        "SG"
      ]
    },
    {
      name: "Đà Nẵng",
      abbreviations: ["ĐN", "DN", "ĐNa"]
    },
    {
      name: "Hải Phòng",
      abbreviations: ["HP"]
    },
    {
      name: "Cần Thơ",
      abbreviations: ["CT"]
    },
    {
      name: "An Giang",
      abbreviations: ["AG"]
    },
    {
      name: "Bà Rịa - Vũng Tàu",
      abbreviations: ["BV"]
    },
    {
      name: "Bạc Liêu",
      abbreviations: ["BL"]
    },
    {
      name: "Bắc Kạn",
      abbreviations: ["BK"]
    },
    {
      name: "Bắc Giang",
      abbreviations: ["BG"]
    },
    {
      name: "Bắc Ninh",
      abbreviations: ["BN", "tp BN"]
    },
    {
      name: "Bến Tre",
      abbreviations: ["BT"]
    },
    {
      name: "Bình Dương",
      abbreviations: ["BD"]
    },
    {
      name: "Bình Định",
      abbreviations: ["BĐ"]
    },
    {
      name: "Bình Phước",
      abbreviations: ["BP"]
    },
    {
      name: "Bình Thuận",
      abbreviations: ["BTh"]
    },
    {
      name: "Cà Mau",
      abbreviations: ["CM"]
    },
    {
      name: "Cao Bằng",
      abbreviations: ["CB"]
    },
    {
      name: "Đắk Lắk",
      abbreviations: ["ĐL"]
    },
    {
      name: "Đắk Nông",
      abbreviations: ["ĐNo"]
    },
    {
      name: "Điện Biên",
      abbreviations: ["ĐB"]
    },
    {
      name: "Đồng Nai",
      abbreviations: ["ĐN"]
    },
    {
      name: "Đồng Tháp",
      abbreviations: ["ĐT"]
    },
    {
      name: "Gia Lai",
      abbreviations: ["GL"]
    },
    {
      name: "Hà Giang",
      abbreviations: ["HG"]
    },
    {
      name: "Hà Nam",
      abbreviations: ["HNA"]
    },
    {
      name: "Hà Tĩnh",
      abbreviations: ["HT"]
    },
    {
      name: "Hải Dương",
      abbreviations: ["HD"]
    },
    {
      name: "Hậu Giang",
      abbreviations: ["HG"]
    },
    {
      name: "Hòa Bình",
      abbreviations: ["HB"]
    },
    {
      name: "Hưng Yên",
      abbreviations: ["HY"]
    },
    {
      name: "Khánh Hòa",
      abbreviations: ["KH"]
    },
    {
      name: "Kiên Giang",
      abbreviations: ["KG"]
    },
    {
      name: "Kon Tum",
      abbreviations: ["KT"]
    },
    {
      name: "Lai Châu",
      abbreviations: ["LC"]
    },
    {
      name: "Lạng Sơn",
      abbreviations: ["LS"]
    },
    {
      name: "Lào Cai",
      abbreviations: ["LCa"]
    },
    {
      name: "Lâm Đồng",
      abbreviations: ["LĐ"]
    },
    {
      name: "Long An",
      abbreviations: ["LA"]
    },
    {
      name: "Nam Định",
      abbreviations: ["NĐ"]
    },
    {
      name: "Nghệ An",
      abbreviations: ["NA"]
    },
    {
      name: "Ninh Bình",
      abbreviations: ["NB"]
    },
    {
      name: "Ninh Thuận",
      abbreviations: ["NT"]
    },
    {
      name: "Phú Thọ",
      abbreviations: ["PT"]
    },
    {
      name: "Phú Yên",
      abbreviations: ["PY"]
    },
    {
      name: "Quảng Bình",
      abbreviations: ["QB"]
    },
    {
      name: "Quảng Nam",
      abbreviations: ["QNa"]
    },
    {
      name: "Quảng Ngãi",
      abbreviations: ["QNg"]
    },
    {
      name: "Quảng Ninh",
      abbreviations: ["QN"]
    },
    {
      name: "Quảng Trị",
      abbreviations: ["QT"]
    },
    {
      name: "Sóc Trăng",
      abbreviations: ["ST"]
    },
    {
      name: "Sơn La",
      abbreviations: ["SL"]
    },
    {
      name: "Tây Ninh",
      abbreviations: ["TN"]
    },
    {
      name: "Thái Bình",
      abbreviations: ["TB"]
    },
    {
      name: "Thái Nguyên",
      abbreviations: ["TNg"]
    },
    {
      name: "Thanh Hóa",
      abbreviations: ["TH"]
    },
    {
      name: "Thừa Thiên Huế",
      abbreviations: ["TTH", "Huế"]
    },
    {
      name: "Tiền Giang",
      abbreviations: ["TG"]
    },
    {
      name: "Trà Vinh",
      abbreviations: ["TV"]
    },
    {
      name: "Tuyên Quang",
      abbreviations: ["TQ"]
    },
    {
      name: "Vĩnh Long",
      abbreviations: ["VL"]
    },
    {
      name: "Vĩnh Phúc",
      abbreviations: ["VP"]
    },
    {
      name: "Yên Bái",
      abbreviations: ["YB"]
    }
  ],
  validation_rules: {
    extract_only_if: [
      "Customer explicitly states province name",
      "Customer uses abbreviation from this mapping"
    ],
    do_not_extract_if: [
      "Abbreviation not in mapping",
      "Store location mentioned by sales",
      "Vague location (ở đây, gần, etc.)"
    ]
  }
};

// The province block sent to the model (second system message).
export const LEAD_EXTRACTION_PROVINCE_PROMPT = JSON.stringify(
  PROVINCE_REFERENCE,
  null,
  2
);

/**
 * Builds the user turn. Mirrors the n8n "user_prompt" assignment, injecting the
 * current time and the formatted conversation JSON.
 * @param {string} conversationJsonString - JSON.stringify of [{role,message,time}]
 * @param {string} nowIso - current datetime (human-readable)
 * @returns {string}
 */
export function buildLeadUserPrompt(conversationJsonString, nowIso) {
  return (
    `**Current time:** ${nowIso}\n\n` +
    "Analyze the conversation and extract customer information. Apply the correct priority rules for information sources and strict validation rules for all fields, especially province validation.\n\n" +
    `**CONVERSATION:** ${conversationJsonString}\n\n` +
    "Return pure JSON object only."
  );
}
