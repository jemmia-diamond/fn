import Database from "services/database";

// Locations that are allowed to include melee diamond products in results
const MELEE_ALLOWED_LOCATION_IDS = [1592780, 1592770, 1599764];

export default class AvailabilityService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  /**
   * Fetch inventory availability for a location from raw_haravan schema
   *
   * @param {number} locId - Haravan location ID
   * @returns {Promise<Array>} Rows: id, barcode, sku, title, product_id,
   *   product_title, category, qty_on_hand, qty_ordered, qty_ready_for_sale, product_image
   */
  async fetchInventory(locId) {
    const allowMelee = MELEE_ALLOWED_LOCATION_IDS.includes(locId);

    return this.db.$queryRaw`
      SELECT
        (v->>'id')::bigint              AS id,
        v->>'barcode'                   AS barcode,
        v->>'sku'                       AS sku,
        v->>'title'                     AS title,
        p.id                            AS product_id,
        p.title                         AS product_title,
        p.product_type                  AS category,
        il.qty_onhand                   AS qty_on_hand,
        il.qty_commited                 AS qty_ordered,
        il.qty_available                AS qty_ready_for_sale,
        img.src                         AS product_image
      FROM raw_haravan.inventory_locations il
      INNER JOIN raw_haravan.products p ON p.id = il.product_id
      INNER JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(p.variants) = 'array' THEN p.variants ELSE '[]'::jsonb END
      ) v ON (v->>'id')::bigint = il.variant_id
      LEFT JOIN LATERAL (
        SELECT im->>'src' AS src
        FROM jsonb_array_elements(
          CASE WHEN jsonb_typeof(p.images) = 'array' THEN p.images ELSE '[]'::jsonb END
        ) im
        ORDER BY (im->>'id')::bigint ASC
        LIMIT 1
      ) img ON TRUE
      WHERE il.qty_onhand > 0
        AND il.loc_id = ${locId}
        AND (${allowMelee} OR NOT EXISTS (SELECT 1 FROM workplace.melee_diamonds md WHERE md.haravan_product_id = p.id))
    `;
  }

  /**
   * Serialize raw database rows into the format expected by the
   * inventory scanner mobile app
   */
  serialize(rows) {
    return rows.map((row) => ({
      id: Number(row.id),
      barcode: row.barcode,
      sku: row.sku,
      title: row.title,
      productID: row.product_id === null ? null : String(row.product_id),
      productImage: row.product_image,
      productTitle: row.product_title,
      category: row.category,
      rfidTags: [],
      qtyOnHand: Number(row.qty_on_hand),
      qtyExtraForReal: 0,
      qtyForReal: 0,
      qtyOrdered: Number(row.qty_ordered),
      qtyReadyForSale: Number(row.qty_ready_for_sale)
    }));
  }
}
