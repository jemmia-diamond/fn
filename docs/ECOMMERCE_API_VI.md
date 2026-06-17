# Tài liệu API E-commerce

Tài liệu này trình bày các endpoint của E-commerce API phiên bản 2 (và các API liên quan) để truy cập dữ liệu sản phẩm Trang sức (Jewelry) và Kim cương (Diamond).

---

## 1. API Trang sức (Jewelry API - V2)

### 1.1. Lấy Danh sách Trang sức
Lấy danh sách các trang sức có phân trang và có thể lọc theo điều kiện.

**Endpoint:**
`GET /ecommerce/v2/products/jewelries`

**Query Parameters (Tham số truy vấn):**
- `categories` (string/array): Lọc theo ID hoặc slug của danh mục.
- `product_types` (string/array): Lọc theo loại sản phẩm.
- `material_colors` (string/array): Lọc theo màu sắc chất liệu.
- `gender` (string/array): Lọc theo giới tính mục tiêu.
- `fineness` (string/array): Lọc theo độ tinh khiết (tuổi) của chất liệu.
- `is_in_stock` (chuỗi "true"|"false"): Lọc theo tình trạng còn hàng trong kho.
- `from` (số): Vị trí bắt đầu phân trang (mặc định: `API_CONFIG.MIN_FROM`).
- `limit` (số): Số lượng mục trên mỗi trang (mặc định: `API_CONFIG.DEFAULT_LIMIT`, tối đa: `API_CONFIG.MAX_LIMIT`).
- `min_price` (số): Mức giá tối thiểu.
- `max_price` (số): Mức giá tối đa.
- `sort_by` (chuỗi): Trường dùng để sắp xếp (mặc định: "price").
- `sort_order` (chuỗi): Hướng sắp xếp, ví dụ: "asc" (tăng dần) hoặc "desc" (giảm dần) (mặc định: "asc").
- `main_holder_size.lower` (số): Kích thước chấu/ổ chính tối thiểu.
- `main_holder_size.upper` (số): Kích thước chấu/ổ chính tối đa.
- `design_tags` (string/array): Lọc theo tag thiết kế.
- `ring_head_styles` (string/array): Lọc theo kiểu dáng mặt nhẫn.
- `ring_band_styles` (string/array): Lọc theo kiểu dáng đai nhẫn.
- `excluded_ring_head_styles` (string/array): Loại trừ các kiểu dáng mặt nhẫn cụ thể.
- `excluded_ring_band_styles` (string/array): Loại trừ các kiểu dáng đai nhẫn cụ thể.
- `return_inventory_metrics` (chuỗi "true"|"false"): Có bao gồm các số liệu về tồn kho hay không.
- `limit_selling_quantity` (số): Giới hạn số lượng có thể bán.
- `product_ids` (string/array): Lấy các sản phẩm cụ thể theo ID.
- `linked_collections` (string/array): Lọc theo các collection được liên kết.
- `matched_diamonds` (chuỗi "true"|"false"): Lọc các trang sức có thể ghép cặp với kim cương.
- `ring_sizes` (string/array): Lọc theo kích thước nhẫn cụ thể (ni nhẫn).
- `warehouse_ids` (string/array): Lọc theo các kho hàng cụ thể.

---

### 1.2. Lấy Chi tiết Trang sức
Lấy thông tin chi tiết của một sản phẩm trang sức hoặc một bộ trang sức cụ thể.

**Endpoint:**
`GET /ecommerce/v2/products/jewelries/:id`

**Path Parameters (Tham số đường dẫn):**
- `id` (số, bắt buộc): ID của trang sức hoặc bộ trang sức.

**Query Parameters (Tham số truy vấn):**
- `type` (chuỗi): Truyền `"set"` nếu ID được yêu cầu thuộc về một product set thay vì một món trang sức đơn lẻ.
- `return_inventory_metrics` (chuỗi "true"|"false"): Có bao gồm các số liệu về tồn kho hay không.
- `limit_selling_quantity` (số): Bao gồm giới hạn số lượng có thể bán.
- `matched_diamonds` (chuỗi "true"|"false"): Bao gồm thông tin các viên kim cương có thể ghép cặp (chỉ áp dụng khi `type` không phải là "set").

---

## 2. API Kim cương (Diamonds API)

*(Lưu ý: Mặc dù các endpoint này sử dụng đường dẫn `/products/diamonds` không có `/v2`, chúng vẫn đóng vai trò là các endpoint chính cho tài nguyên kim cương song song với các API Trang sức V2).*

### 2.1. Lấy Danh sách Kim cương
Lấy danh sách các viên kim cương có phân trang và có thể lọc theo điều kiện.

**Endpoint:**
`GET /ecommerce/products/diamonds`

**Query Parameters (Tham số truy vấn):**
- `shapes` (chuỗi): Danh sách các hình dạng kim cương, phân cách bằng dấu phẩy.
- `colors` (chuỗi): Danh sách các màu sắc kim cương, phân cách bằng dấu phẩy.
- `clarities` (chuỗi): Danh sách các độ tinh khiết kim cương, phân cách bằng dấu phẩy.
- `fluorescence` (chuỗi): Danh sách các mức độ huỳnh quang, phân cách bằng dấu phẩy.
- `edge_size.lower` (số): Kích thước cạnh (ly) tối thiểu.
- `edge_size.upper` (số): Kích thước cạnh (ly) tối đa.
- `price.min` (số): Mức giá tối thiểu.
- `price.max` (số): Mức giá tối đa.
- `sort.by` (chuỗi): Trường dùng để sắp xếp.
- `sort.order` (chuỗi): Hướng sắp xếp ("asc" hoặc "desc").
- `limit` (số): Số lượng mục trên mỗi trang.
- `from` (số): Vị trí bắt đầu phân trang (offset).
- `linked_collections` (chuỗi): Danh sách các collection được liên kết, phân cách bằng dấu phẩy.

---

### 2.2. Lấy Chi tiết Kim cương
Lấy thông tin chi tiết của một viên kim cương cụ thể.

**Endpoint:**
`GET /ecommerce/products/diamonds/:id`

**Path Parameters (Tham số đường dẫn):**
- `id` (số, bắt buộc): Variant ID của viên kim cương.

---

## 3. API Nhẫn cưới (Wedding Rings API)

### 3.1. Lấy Danh sách Nhẫn cưới
Lấy danh sách các nhẫn cưới có phân trang và có thể lọc theo điều kiện.

**Endpoint:**
`GET /ecommerce/products/wedding_rings`

**Query Parameters (Tham số truy vấn):**
- `from` (số): Vị trí bắt đầu phân trang.
- `limit` (số): Số lượng mục trên mỗi trang.
- `fineness` (string/array): Lọc theo độ tinh khiết (tuổi) của chất liệu.
- `material_colors` (string/array): Lọc theo màu sắc chất liệu.
- `is_in_stock` (chuỗi "true"|"false"): Lọc theo tình trạng còn hàng trong kho.
- `sort_by` (chuỗi): Trường dùng để sắp xếp (mặc định: "price").
- `sort_order` (chuỗi): Hướng sắp xếp, ví dụ: "asc" (tăng dần) hoặc "desc" (giảm dần) (mặc định: "asc").
- `min_price` (số): Mức giá tối thiểu.
- `max_price` (số): Mức giá tối đa.
- `product_ids` (string/array): Lấy các sản phẩm cụ thể theo ID.
- `ring_band_styles` (string/array): Lọc theo kiểu dáng đai nhẫn.
- `excluded_ring_band_styles` (string/array): Loại trừ các kiểu dáng đai nhẫn cụ thể.

---

### 3.2. Lấy Chi tiết Nhẫn cưới
Lấy thông tin chi tiết của một chiếc nhẫn cưới cụ thể.

**Endpoint:**
`GET /ecommerce/products/wedding_rings/:id`

**Path Parameters (Tham số đường dẫn):**
- `id` (số, bắt buộc): ID của nhẫn cưới.
