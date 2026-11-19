import { HTTPException } from "hono/http-exception";
import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const FIELDS = [
  "serial_number",
  "final_encoded_barcode",
  "barcode",
  "product_name",
  "stock_at",
  "order_reference",
  "fulfillment_status_value"
].join(",");

/**
 * Serial search for the inventory scanner app. Serials live in the NocoDB
 * Supply base (variant_serials); `final_encoded_barcode` is the exact RFID
 * tag printed for that one piece.
 */
export default class SerialSearchService {
  constructor(env) {
    this.nocodb = new NocoDBClient(env);
  }

  /**
   * @param {{ q?: string, page?: string, limit?: string }} params - raw query params
   * @throws {HTTPException} 400 when the query is too short
   */
  async search({ q, page, limit } = {}) {
    const query = String(q ?? "").replace(/[^A-Za-z0-9-]/g, "");
    if (query.length < MIN_QUERY_LENGTH) {
      throw new HTTPException(400, {
        message: `Query must have at least ${MIN_QUERY_LENGTH} characters`
      });
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number.parseInt(limit, 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const response = await this.nocodb.listRecords(
      NOCODB_TABLES.SUPPLY.SERIALS,
      {
        where: `(serial_number,like,%${query}%)`,
        fields: FIELDS,
        sort: "serial_number",
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize
      }
    );

    return {
      items: (response?.list || []).map((row) => this.serialize(row)),
      hasMore: response?.pageInfo ? !response.pageInfo.isLastPage : false
    };
  }

  serialize(row) {
    return {
      serial: row.serial_number,
      rfid: row.final_encoded_barcode || null,
      barcode: row.barcode || null,
      productTitle: row.product_name || null,
      stockAt: row.stock_at || null,
      orderReference: row.order_reference || null,
      fulfillmentStatus: row.fulfillment_status_value || null
    };
  }
}
