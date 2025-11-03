import Database from "services/database";
import { Prisma } from "@prisma-cli";
import { buildGetDiamondsQuery } from "services/ecommerce/diamond/utils/diamond";
import * as Sentry from "@sentry/cloudflare";

export default class DiamondService {
  constructor(env) {
    this.db = Database.instance(env, "neon");
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
          CAST(product_id AS INT) AS product_id,
          CAST(variant_id AS INT) AS variant_id,
          report_no, shape, CAST(carat AS DOUBLE PRECISION) AS carat, color, clarity, cut,
          edge_size_1, edge_size_2, CAST(price AS DOUBLE PRECISION) as compare_at_price,
          CAST(CASE 
            WHEN promotions ILIKE '%8%%' THEN ROUND(price * 0.92, 2)
            ELSE price
          END AS DOUBLE PRECISION) AS price
        FROM workplace.diamonds
        WHERE variant_id = ${variantId}
        LIMIT 1;
      `;
      return result?.[0] || null;
    } catch (e) {
      Sentry.captureException(e);
      throw e;
    }
  }
}
