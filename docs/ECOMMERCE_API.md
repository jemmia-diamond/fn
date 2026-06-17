# E-commerce API Documentation

This document outlines the version 2 (and related) E-commerce API endpoints for accessing Jewelry and Diamond products.

---

## 1. Jewelries API (V2)

### 1.1. Get Jewelry List
Retrieve a paginated, filtered list of jewelries.

**Endpoint:**
`GET /ecommerce/v2/products/jewelries`

**Query Parameters:**
- `categories` (string/array): Filter by category IDs or slugs.
- `product_types` (string/array): Filter by product types.
- `material_colors` (string/array): Filter by material colors.
- `gender` (string/array): Filter by target gender(s).
- `fineness` (string/array): Filter by material fineness.
- `is_in_stock` (string "true"|"false"): Filter by stock availability.
- `from` (number): Pagination start index (default: `API_CONFIG.MIN_FROM`).
- `limit` (number): Number of items per page (default: `API_CONFIG.DEFAULT_LIMIT`, max: `API_CONFIG.MAX_LIMIT`).
- `min_price` (number): Minimum price.
- `max_price` (number): Maximum price.
- `sort_by` (string): Field to sort by (default: "price").
- `sort_order` (string): Sort direction, e.g., "asc" or "desc" (default: "asc").
- `main_holder_size.lower` (number): Minimum main holder size.
- `main_holder_size.upper` (number): Maximum main holder size.
- `design_tags` (string/array): Filter by design tags.
- `ring_head_styles` (string/array): Filter by ring head styles.
- `ring_band_styles` (string/array): Filter by ring band styles.
- `excluded_ring_head_styles` (string/array): Exclude specific ring head styles.
- `excluded_ring_band_styles` (string/array): Exclude specific ring band styles.
- `return_inventory_metrics` (string "true"|"false"): Whether to include inventory metrics.
- `limit_selling_quantity` (number): Limit selling quantity constraint.
- `product_ids` (string/array): Fetch specific products by their IDs.
- `linked_collections` (string/array): Filter by linked collections.
- `matched_diamonds` (string "true"|"false"): Filter for jewelry that can be matched with diamonds.
- `ring_sizes` (string/array): Filter by specific ring sizes.
- `warehouse_ids` (string/array): Filter by specific warehouses.

---

### 1.2. Get Jewelry Detail
Retrieve detailed information for a specific jewelry item or set.

**Endpoint:**
`GET /ecommerce/v2/products/jewelries/:id`

**Path Parameters:**
- `id` (number, required): The ID of the jewelry or set.

**Query Parameters:**
- `type` (string): Set to `"set"` if the requested ID belongs to a product set rather than a single jewelry item.
- `return_inventory_metrics` (string "true"|"false"): Whether to include inventory metrics.
- `limit_selling_quantity` (number): Include selling quantity limit.
- `matched_diamonds` (string "true"|"false"): Include matching diamond info (only applicable when `type` is not "set").

---

## 2. Diamonds API

*(Note: Although these use the `/products/diamonds` path without `/v2`, they serve as the primary endpoints for diamond resources alongside the V2 jewelry APIs).*

### 2.1. Get Diamond List
Retrieve a paginated, filtered list of diamonds.

**Endpoint:**
`GET /ecommerce/products/diamonds`

**Query Parameters:**
- `shapes` (string): Comma-separated list of diamond shapes.
- `colors` (string): Comma-separated list of diamond colors.
- `clarities` (string): Comma-separated list of diamond clarities.
- `fluorescence` (string): Comma-separated list of fluorescence levels.
- `edge_size.lower` (number): Minimum edge size.
- `edge_size.upper` (number): Maximum edge size.
- `price.min` (number): Minimum price.
- `price.max` (number): Maximum price.
- `sort.by` (string): Field to sort by.
- `sort.order` (string): Sort direction ("asc" or "desc").
- `limit` (number): Number of items per page.
- `from` (number): Pagination offset.
- `linked_collections` (string): Comma-separated list of linked collections.

---

### 2.2. Get Diamond Detail
Retrieve detailed information for a specific diamond.

**Endpoint:**
`GET /ecommerce/products/diamonds/:id`

**Path Parameters:**
- `id` (number, required): The Variant ID of the diamond.
