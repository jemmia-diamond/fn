export default class BaseWorkplaceClient {
  constructor(api, baseId, tableName) {
    this.api = api;
    this.baseId = baseId;
    this.tableName = tableName;
  }

  async list(params = {}) {
    return await this.api.dbTableRow.list("noco", this.baseId, this.tableName, params);
  }

  async findOne(params = {}) {
    const res = await this.list({ ...params, limit: 1 });
    return res.list?.[0] ?? null;
  }

  async getById(id) {
    const res = await this.list({ where: `(id,eq,${id})`, limit: 1 });
    return res.list?.[0] ?? null;
  }

  async create(data) {
    return await this.api.dbTableRow.create("noco", this.baseId, this.tableName, data);
  }

  async update(id, data) {
    return await this.api.dbTableRow.update("noco", this.baseId, this.tableName, id, data);
  }

  async bulkUpdate(records) {
    return await this.api.dbTableRow.bulkUpdate("noco", this.baseId, this.tableName, records);
  }

  async deleteMany(records) {
    return await this.api.dbTableRow.bulkDelete("noco", this.baseId, this.tableName, records);
  }
}

