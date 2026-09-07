import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

export default class DiamondStockTagService {
  constructor(env) {
    this.env = env;
  }

  async updateStockTag(diamondId, hasStock) {
    const nocodb = new NocoDBClient(this.env);
    const diamondTableId = NOCODB_TABLES.SUPPLY.DIAMONDS;

    await nocodb.updateRecords(diamondTableId, {
      id: diamondId,
      is_incoming: hasStock ? null : true
    });
  }

  async findVariantsByGiaReport(diamond) {
    const nocodb = new NocoDBClient(this.env);
    const variantTableId = NOCODB_TABLES.SUPPLY.VARIANTS;
    const giaReportNo = diamond.report_no;
    return await nocodb.listRecords(variantTableId, {
      where: `(sku,like,%${giaReportNo}%)`
    });
  }
}
