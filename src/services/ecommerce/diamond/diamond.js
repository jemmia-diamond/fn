import Database from "services/database";
import { Prisma } from "@prisma-cli";
import { buildGetDiamondsQuery } from "services/ecommerce/diamond/utils/diamond";
import { dataSql, formatData } from "services/ecommerce/diamond/utils/diamond-prices";
import * as Sentry from "@sentry/cloudflare";
import { retryQuery } from "services/utils/retry-utils";

export default class DiamondService {
  constructor(env) {
    this.db = Database.instance(env);
    this.env = env;
  }

  async getDiamonds(jsonParams) {
    try {
      const { dataSql, countSql } = buildGetDiamondsQuery(jsonParams);

      const data = await retryQuery(() => this.db.$queryRaw`${Prisma.raw(dataSql)}`);
      const count = await retryQuery(() => this.db.$queryRaw`${Prisma.raw(countSql)}`);

      return {
        data,
        metadata: {
          total: count.length ? Number(count[0].total) : 0,
          pagination: jsonParams.pagination
        }
      };
    } catch (e) {
      Sentry.captureException(e);
      throw e;
    }
  }

  async getDiamondByVariantId(variantId) {
    try {
      const result = await retryQuery(() => this.db.$queryRaw`
        SELECT
          CAST(d.product_id AS INT) AS product_id,
          CAST(d.variant_id AS INT) AS variant_id,
          d.report_no,
          d.shape,
          CAST(d.carat AS DOUBLE PRECISION) AS carat,
          d.color,
          d.clarity,
          d.cut,
          d.fluorescence,
          d.edge_size_1, d.edge_size_2,
          CAST(d.price AS DOUBLE PRECISION) as compare_at_price,
          CAST(
            CASE
              WHEN COALESCE(discount_info.max_discount, 0) > 0 THEN ROUND(d.price * (100 - discount_info.max_discount) / 100, 2)
              ELSE d.price
            END
          AS DOUBLE PRECISION) AS price,
          CAST(d.final_discounted_price AS DOUBLE PRECISION) as final_discounted_price,
          p.handle,
          p.title,
          ARRAY(
            SELECT i.src
            FROM haravan.images i
            WHERE i.product_id = d.product_id
              AND (
                i.variant_ids IS NULL
                OR i.variant_ids = '[]'
                OR d.variant_id = ANY(
                  SELECT (jsonb_array_elements_text(i.variant_ids::jsonb))::INT
                )
              )
          ) AS images,
          g.simple_encrypted_report_no
        FROM workplace.diamonds AS d
        JOIN haravan.products AS p ON p.id = d.product_id AND p.published_scope IN ('web', 'global')
        LEFT JOIN gia.report_no_data AS g ON g.report_no::BIGINT = d.report_no::BIGINT
        JOIN haravan.variants hv ON hv.id = d.variant_id AND hv.qty_available > 0 AND hv.title LIKE 'GIA%' AND hv.published_scope IN ('web', 'global')
        JOIN (
          SELECT hwi.variant_id
          FROM haravan.warehouse_inventories hwi
          JOIN haravan.warehouses hw ON hwi.loc_id = hw.id
          WHERE hw.name IN (
            '[HCM] Cửa Hàng HCM',
            '[HN] Cửa Hàng HN',
            '[CT] Cửa Hàng Cần Thơ'
          )
          GROUP BY hwi.variant_id
          HAVING SUM(hwi.qty_available) > 0
        ) inventory_check ON inventory_check.variant_id = d.variant_id
        LEFT JOIN (
          SELECT m.diamond_id, MAX(CAST(hc.discount_value AS NUMERIC)) as max_discount
          FROM workplace.diamonds_haravan_collection m
          JOIN workplace.haravan_collections hc ON m.haravan_collection_id = hc.id
          WHERE hc.discount_type IS NOT NULL AND hc.discount_type <> ''
          GROUP BY m.diamond_id
        ) discount_info ON discount_info.diamond_id = d.id
        WHERE d.variant_id = ${variantId}
        LIMIT 1;
      `);
      return result?.[0] ? {
        ...result[0],
        gia_url: result[0].simple_encrypted_report_no ? `${this.env.R2_JEMMIA_WEBSITE_PUBLIC_URL}/website/gia-reports/${result[0].simple_encrypted_report_no}.png` : null
      } : null;
    } catch (e) {
      Sentry.captureException(e);
      throw e;
    }
  }

  async getDiamondPriceList() {
    const rows = await retryQuery(() => this.db.$queryRaw`${Prisma.raw(dataSql)}`);
    const result = formatData(rows);
    return result;
  }

  /**
   * Fetches diamond status and prices for a specific campaign.
   * @param {Array<{s1: number, s2: number, color: string, clarity: string, original_price: number}>} targets
   * @param {Array<string>} warehouseNames
   */
  async getDiamondStockTracker(targets, warehouseNames) {
    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      throw new Error("Targets are required and must be a non-empty array");
    }

    const defaultWarehouses = [
      "[HCM] Cửa Hàng HCM",
      "[HN] Cửa Hàng HN",
      "[CT] Cửa Hàng Cần Thơ"
    ];
    const targetWarehouses = warehouseNames && Array.isArray(warehouseNames) && warehouseNames.length > 0
      ? warehouseNames
      : defaultWarehouses;

    try {
      const valuesClause = targets.map(t => {
        const s1 = parseFloat(t.s1);
        const s2 = parseFloat(t.s2);
        const price = parseFloat(t.original_price);
        if (isNaN(s1) || isNaN(s2) || isNaN(price)) {
          throw new Error("Invalid numeric values in targets");
        }
        const color = t.color.replace(/'/g, "''");
        const clarity = t.clarity.replace(/'/g, "''");
        return `(${s1}::real, ${s2}::real, '${color}', '${clarity}', ${price}::numeric)`;
      }).join(", ");

      const warehouseNamesList = targetWarehouses.map(name => `'${name.replace(/'/g, "''")}'`).join(", ");

      const sql = `
        WITH TargetConditions AS (
          SELECT DISTINCT * FROM (VALUES
            ${valuesClause}
          ) AS t(s1, s2, col, clar, orig_price)
        ),
        RetailInventoryStatus AS (
          SELECT 
            hwi.variant_id,
            SUM(hwi.qty_available) as retail_stock
          FROM haravan.warehouse_inventories hwi
          JOIN haravan.warehouses hw ON hwi.loc_id = hw.id
          WHERE hw.name IN (${warehouseNamesList})
          GROUP BY hwi.variant_id
        )
        SELECT
          d.id,
          d.report_no,
          d.edge_size_1 || ' x ' || d.edge_size_2 AS size,
          d.color,
          d.clarity,
          d.price AS base_price,
          CAST(
            CASE
              WHEN COALESCE(discount_data.max_discount, 0) > 0 
              THEN ROUND(d.price * (100 - discount_data.max_discount) / 100, 2)
              ELSE d.price
            END
          AS DOUBLE PRECISION) AS current_price,
          COALESCE(inv.retail_stock, 0) AS status,
          COALESCE(discount_data.max_discount, 0) AS active_discount,
          collection_list.titles AS active_collections
        FROM workplace.diamonds d
        JOIN TargetConditions tc ON (
          d.edge_size_1 = tc.s1 
          AND d.edge_size_2 = tc.s2
          AND d.color = tc.col
          AND d.clarity = tc.clar
          AND d.price = tc.orig_price
        )
        LEFT JOIN RetailInventoryStatus inv ON inv.variant_id = d.variant_id
        LEFT JOIN (
          SELECT m.diamond_id, MAX(CAST(hc.discount_value AS NUMERIC)) as max_discount
          FROM workplace.diamonds_haravan_collection m
          JOIN workplace.haravan_collections hc ON m.haravan_collection_id = hc.id
          WHERE hc.discount_type = 'percent'
          GROUP BY m.diamond_id
        ) discount_data ON discount_data.diamond_id = d.id
        LEFT JOIN (
          SELECT m.diamond_id, STRING_AGG(hc.title, ', ') as titles
          FROM workplace.diamonds_haravan_collection m
          JOIN workplace.haravan_collections hc ON m.haravan_collection_id = hc.id
          GROUP BY m.diamond_id
        ) collection_list ON collection_list.diamond_id = d.id
        WHERE d.auto_create_haravan_product = true
        ORDER BY d.edge_size_1 DESC, d.color ASC, d.clarity ASC;
      `;

      const result = await retryQuery(() => this.db.$queryRaw`${Prisma.raw(sql)}`);
      return result;
    } catch (e) {
      Sentry.captureException(e);
      throw e;
    }
  }
}
