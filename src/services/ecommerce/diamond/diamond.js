import Database from "services/database";
import { Prisma } from "@prisma-cli";
import { buildGetDiamondsQuery } from "services/ecommerce/diamond/utils/diamond";
import { dataSql, formatData } from "services/ecommerce/diamond/utils/diamond-prices";
import * as Sentry from "@sentry/cloudflare";

export default class DiamondService {
  constructor(env) {
    this.db = Database.instance(env);
    this.env = env;
  }

  async getDiamonds(jsonParams) {
    try {
      const { dataSql, countSql } = buildGetDiamondsQuery(jsonParams);

      const data = await this.db.$queryRaw`${Prisma.raw(dataSql)}`;
      const count = await this.db.$queryRaw`${Prisma.raw(countSql)}`;

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
      const result = await this.db.$queryRaw`
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
      `;
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
    const rows = await this.db.$queryRaw`${Prisma.raw(dataSql)}`;
    const result = formatData(rows);
    return result;
  }
}
