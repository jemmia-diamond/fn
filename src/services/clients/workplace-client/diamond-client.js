export default class DiamondClient {
  constructor(api, baseId) {
    this.api = api;
    this.baseId = baseId;
    this.tableName = "diamonds";
  }

  async get(id) {
    const res = await this.api.dbTableRow.list(
      "noco",
      this.baseId,
      this.tableName,
      {
        where: `(id,eq,${id})`,
        limit: 1
      }
    );
    return res.list[0];
  }
}
