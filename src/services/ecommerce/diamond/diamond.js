import Database from "services/database";
import { buildGetDiamondsQuery } from "services/ecommerce/diamond/utils/diamond";
import {
  dataSql,
  formatData
} from "services/ecommerce/diamond/utils/diamond-prices";
import * as Sentry from "@sentry/cloudflare";
import { retryQuery } from "services/utils/retry-utils";
import { buildStockTrackerQuery } from "services/ecommerce/diamond/utils/diamond-stock-tracker";

export default class DiamondService {
  constructor(env) {
    this.db = Database.instance(env);
    this.env = env;
  }

  async getDiamonds(jsonParams) {
    try {
      const { dataSql, countSql } = buildGetDiamondsQuery(jsonParams);

      const data = await retryQuery(() => this.db.$queryRaw(dataSql));
      const count = await retryQuery(() => this.db.$queryRaw(countSql));

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
    if (!variantId || isNaN(Number(variantId))) return null;
    try {
      const result = await retryQuery(
        () => this.db.$queryRaw`
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
            CAST(d.compare_at_price AS DOUBLE PRECISION) as compare_at_price,
            CAST(d.price AS DOUBLE PRECISION) AS price,
            CAST(d.final_discounted_price AS DOUBLE PRECISION) as final_discounted_price,
            d.handle,
            d.title,
            d.images,
            g.simple_encrypted_report_no
          FROM marts_ecom.fct_ecom_diamonds_catalog AS d
          LEFT JOIN gia.report_no_data AS g ON g.report_no::BIGINT = d.report_no::BIGINT
          WHERE d.variant_id = ${variantId}
          LIMIT 1;
        `
      );
      return result?.[0]
        ? {
            ...result[0],
            gia_url: result[0].simple_encrypted_report_no
              ? `${this.env.R2_JEMMIA_WEBSITE_PUBLIC_URL}/website/gia-reports/${result[0].simple_encrypted_report_no}.png`
              : null
          }
        : null;
    } catch (e) {
      Sentry.captureException(e);
      throw e;
    }
  }

  async getDiamondPriceList() {
    const rows = await retryQuery(() => this.db.$queryRaw(dataSql));
    const result = formatData(rows);
    return result;
  }

  /**
   * Fetches diamond status and prices for a specific campaign.
   * @param {Array<{s1: number, s2: number, carat: number | Object, color: string, clarity: string, fluorescence: string, original_price: number}>} targets
   * @param {Array<string>} warehouseNames
   */
  async getDiamondStockTracker(targets, warehouseNames) {
    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      throw new Error("Targets are required and must be a non-empty array");
    }

    const targetWarehouses =
      warehouseNames &&
      Array.isArray(warehouseNames) &&
      warehouseNames.length > 0
        ? warehouseNames
        : [];

    const sql = buildStockTrackerQuery(targets, targetWarehouses);

    const result = await retryQuery(() => this.db.$queryRaw(sql));

    const groupedResults = targets.map((target, idx) => {
      const matchingDiamonds = result.filter(
        (row) => row.target_index === idx + 1
      );

      let diamondsList;
      if (
        matchingDiamonds.length === 0 ||
        (matchingDiamonds.length === 1 && matchingDiamonds[0].id === null)
      ) {
        const s1 = target.s1 ?? null;
        const s2 = target.s2 ?? null;
        const sizeStr = s1 && s2 ? `${s1} x ${s2}` : s1 || s2 || null;

        diamondsList = [
          {
            id: null,
            product_id: null,
            variant_id: null,
            sku: null,
            report_no: null,
            edge_size_1: s1,
            edge_size_2: s2,
            size: sizeStr,
            color: target.color ?? null,
            clarity: target.clarity ?? null,
            fluorescence: target.fluorescence ?? null,
            carat: target.carat ?? null,
            base_price: target.original_price ?? null,
            current_price: target.original_price ?? null,
            total_stock: 0,
            sale_status: "Không có hàng",
            in_order: null,
            order_date: null,
            active_collection: null
          }
        ];
      } else {
        diamondsList = matchingDiamonds.map((d) => {
          const { target_index: _target_index, ...cleanDiamond } = d;
          return cleanDiamond;
        });
      }

      return {
        combination: target,
        diamonds: diamondsList
      };
    });

    return groupedResults;
  }
}
