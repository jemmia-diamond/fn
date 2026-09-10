# NocoDB Base ERD and Webhooks Reference - R&D

This document provides a complete reference of the NocoDB workspace tables, relationships (ERD), and active webhooks for the **R&D** base.

## Database Overview
* **Base ID**: `pb27venes8j6u17`
* **Total Tables**: 53
* **Active Webhooks**: 5

---

## Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    haravan_collections ||--o{ diamonds : "relation"
    haravan_collections ||--o{ products : "relation"
    haravan_collections ||--o{ diamonds_haravan_collection : "relation"
    haravan_collections ||--o{ variants : "relation"
    jewelries ||--o{ jewelries : "relation"
    jewelries ||--o{ size_details : "relation"
    sets ||--o{ design_set : "relation"
    variant_serials ||--o{ temporary_products : "relation"
    variant_serials ||--o{ diamonds : "relation"
    variants ||--o{ variant_serials : "relation"
    wedding_rings ||--o{ designs : "relation"
    policy_groups ||--o{ policy_rules : "relation"
    policy_groups ||--o{ variant_serials : "relation"
    policy_groups ||--o{ variants : "relation"
    policy_groups ||--o{ policy_group_history : "relation"
    collections ||--o{ designs : "relation"
    policy_versions ||--o{ policy_rules : "relation"
    designs ||--o{ design_images : "relation"
    designs ||--o{ design_price_estimation : "relation"
    designs ||--o{ ecom_old_products : "relation"
    designs ||--o{ temporary_products : "relation"
    designs ||--o{ jewelries : "relation"
    designs ||--o{ products : "relation"
    designs ||--o{ design_set : "relation"
    designs ||--o{ design_melee_details : "relation"
    designs ||--o{ design_event_jobs : "relation"
    diamonds ||--o{ diamonds_haravan_collection : "relation"
    diamonds ||--o{ policy_group_history : "relation"
    diamonds ||--o{ diamonds_history : "relation"
    moissanite ||--o{ moissanite_serials : "relation"
    products ||--o{ ecom_360 : "relation"
    products ||--o{ variants : "relation"
```

---

## Tables and Relations

| Table Name | Primary Key | Columns Count | Relations (Linked Tables) |
|---|---|---|---|
| **policy_group_history** | `id` | 15 | *None* |
| **ecom_360** | `id` | 6 | *None* |
| **ecom_old_products** | `id` | 14 | *None* |
| **haravan_collections** | `id` | 25 | `diamonds` -> **diamonds** (hm)<br/>`products` -> **products** (hm)<br/>`diamonds_haravan_collections` -> **diamonds_haravan_collection** (hm)<br/>`diamonds1` -> **diamonds** (mm)<br/>`products_haravan_collections` -> **unknown** (hm)<br/>`products1` -> **products** (mm)<br/>`variants_haravan_collections` -> **unknown** (hm)<br/>`variants` -> **variants** (mm) |
| **jewelries** | `id` | 59 | `jewelries` -> **jewelries** (hm)<br/>`size_details` -> **size_details** (hm) |
| **design_set** | `id` | 7 | *None* |
| **sets** | `id` | 10 | `design_sets` -> **design_set** (hm) |
| **temporary_products** | `id` | 32 | *None* |
| **temporary_products_web** | `id` | 32 | *None* |
| **variant_serials** | `id` | 52 | `temporary_products` -> **temporary_products** (hm)<br/>`variant_serials_diamonds` -> **unknown** (hm)<br/>`diamonds` -> **diamonds** (mm) |
| **variant_serials_lark** | `id` | 3 | *None* |
| **variants** | `id` | 36 | `variant_serials` -> **variant_serials** (hm)<br/>`variants_haravan_collections` -> **unknown** (hm)<br/>`haravan_collections` -> **haravan_collections** (mm) |
| **salesaya_temporary_product** | `id` | 1 | *None* |
| **wedding_rings** | `id` | 5 | `designs` -> **designs** (hm) |
| **policy_groups** | `id` | 16 | `policy_rules` -> **policy_rules** (hm)<br/>`variant_serials` -> **variant_serials** (hm)<br/>`variants` -> **variants** (hm)<br/>`policy_group_histories` -> **policy_group_history** (hm) |
| **policy_rules** | `id` | 22 | *None* |
| **temtab** | `id` | 20 | *None* |
| **moissanite_serials** | `id` | 6 | *None* |
| **salesaya_haravan_collections** | `id` | 6 | *None* |
| **diamonds_haravan_collection** | `diamond_id` | 9 | *None* |
| **collections** | `id` | 11 | `designs` -> **designs** (hm) |
| **policy_versions** | `id` | 16 | `policy_rules` -> **policy_rules** (hm) |
| **design_details** | `id` | 11 | *None* |
| **design_images** | `id` | 15 | *None* |
| **designs** | `id` | 82 | `design_images` -> **design_images** (hm)<br/>`design_price_estimations` -> **design_price_estimation** (hm)<br/>`ecom_old_products` -> **ecom_old_products** (hm)<br/>`temporary_products` -> **temporary_products** (hm)<br/>`jewelries` -> **jewelries** (hm)<br/>`products` -> **products** (hm)<br/>`design_sets` -> **design_set** (hm)<br/>`_nc_m2m_design_melee_de_designs` -> **unknown** (hm)<br/>`designs_design_event_jobs` -> **unknown** (hm)<br/>`design_melee_details` -> **design_melee_details** (mm)<br/>`design_event_jobs` -> **design_event_jobs** (mm) |
| **design_melee_details** | `id` | 16 | `_nc_m2m_design_melee_de_designs` -> **unknown** (hm)<br/>`designs` -> **designs** (mm) |
| **melee_diamonds** | `id` | 10 | *None* |
| **design_price_estimation** | `id` | 6 | *None* |
| **designs_temporary_products** | `id` | 10 | *None* |
| **diamond_price_list** | `id` | 8 | *None* |
| **designs** | `id` | 45 | *None* |
| **diamonds** | `id` | 54 | `diamonds_haravan_collections` -> **diamonds_haravan_collection** (hm)<br/>`haravan_collections1` -> **haravan_collections** (mm)<br/>`policy_group_histories` -> **policy_group_history** (hm)<br/>`variant_serials_diamonds` -> **unknown** (hm)<br/>`variant_serials` -> **variant_serials** (mm)<br/>`diamonds_history_diamonds` -> **unknown** (hm)<br/>`diamonds_histories` -> **diamonds_history** (mm) |
| **materials** | `id` | 8 | *None* |
| **moissanite** | `id` | 18 | `moissanite_serials` -> **moissanite_serials** (hm) |
| **submitted_codes** | `id` | 9 | *None* |
| **promotions** | `id` | 17 | *None* |
| **size_details** | `id` | 13 | *None* |
| **collections** | `id` | 6 | *None* |
| **collections** | `id` | 6 | *None* |
| **designs** | `id` | 45 | *None* |
| **diamonds** | `id` | 19 | *None* |
| **diamonds** | `id` | 19 | *None* |
| **diamonds_data_validations** | `id` | 8 | *None* |
| **diamonds_data_validations** | `id` | 8 | *None* |
| **jewelries** | `id` | 9 | *None* |
| **jewelries** | `id` | 10 | *None* |
| **variant_size_details** | `id` | 9 | *None* |
| **variant_size_details** | `id` | 9 | *None* |
| **variants** | `id` | 15 | *None* |
| **variants** | `id` | 15 | *None* |
| **products** | `id` | 42 | `ecom_360s` -> **ecom_360** (hm)<br/>`variants` -> **variants** (hm)<br/>`products_haravan_collections` -> **unknown** (hm)<br/>`haravan_collections1` -> **haravan_collections** (mm) |
| **diamonds_history** | `id` | 21 | `diamonds_history_diamonds` -> **unknown** (hm)<br/>`diamonds` -> **diamonds** (mm) |
| **design_event_jobs** | `id` | 16 | `designs_design_event_jobs` -> **unknown** (hm)<br/>`designs` -> **designs** (mm) |

---

## Webhook Configurations

The following webhooks are configured across the NocoDB tables:

| Source Table | Webhook Title | Event / Operation | Active | Method | Destination / Path | Condition |
|---|---|---|---|---|---|---|
| **diamonds_haravan_collection** | Webhook-1 | `after` on `insert, delete` | ✅ Yes | `POST` | `https://wheab17f0d08db52fd98.free.beeceptor.com` | `false` |
| **designs** | sync 4view | `manual` on `trigger` | ✅ Yes | `POST` | `https://fn.jemmia.vn/webhook/noco/designs/sync-4view` | `false` |
| **designs** | Sync render | `manual` on `trigger` | ✅ Yes | `POST` | `https://fn.jemmia.vn/webhook/noco/designs/sync-render` | `false` |
| **submitted_codes** | Check Out | `manual` on `trigger` | ✅ Yes | `POST` | `https://fn.jemmia.vn/webhook/noco/submitted-codes/process?type=checkout` | `false` |
| **submitted_codes** | Apply | `manual` on `trigger` | ✅ Yes | `POST` | `https://fn.jemmia.vn/webhook/noco/submitted-codes/process` | `false` |
