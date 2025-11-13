import Database from "services/database";
import { Prisma } from "@prisma-cli";
import { buildGetDiamondsQuery } from "services/ecommerce/diamond/utils/diamond";
import * as Sentry from "@sentry/cloudflare";

export default class DiamondService {
  constructor(env) {
    this.db = Database.instance(env, "neon");
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
          CAST(CASE
            WHEN d.promotions ILIKE '%8%%' THEN ROUND(d.price * 0.92, 2)
            ELSE d.price
          END AS DOUBLE PRECISION) AS price,
          CAST(d.final_discounted_price AS DOUBLE PRECISION) as final_discounted_price,
          p.handle,
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
        JOIN haravan.products AS p ON p.id = d.product_id
        LEFT JOIN gia.report_no_data AS g ON g.report_no::BIGINT = d.report_no::BIGINT
        WHERE variant_id = ${variantId}
        LIMIT 1;
      `;
      return result?.[0] ? {
        ...result?.[0],
        gia_url: result?.[0].simple_encrypted_report_no
          ? `${this.env.R2_JEMMIA_WEBSITE_PUBLIC_URL}/website/gia-reports/${result?.[0].simple_encrypted_report_no}.png`
          : null
      } : null;
    } catch (e) {
      Sentry.captureException(e);
      throw e;
    }
  }
}
