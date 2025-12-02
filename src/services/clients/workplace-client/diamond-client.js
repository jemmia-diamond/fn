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

  async update(id, data) {
    const res = await this.api.dbTableRow.update(
      "noco",
      this.baseId,
      this.tableName,
      id,
      data
    );
    return res;
  }

  async findOne(params = {}) {
    const res = await this.api.dbTableRow.list(
      "noco",
      this.baseId,
      this.tableName,
      {
        ...params,
        limit: 1
      }
    );
    return res.list[0];
  }
}
