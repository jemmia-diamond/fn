export default class DesignsClient {
  constructor(api, baseId) {
    this.api = api;
    this.baseId = baseId;
    this.tableName = "designs";
  }

  async getByDesignCode(designCode) {
    const res = await this.api.dbTableRow.list("noco", this.baseId, this.tableName, {
      where: `(design_code,eq,${designCode})`,
      limit: 1
    });
    return res.list?.[0] ?? null;
  }

}
