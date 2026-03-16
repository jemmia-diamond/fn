export default class BaseWorkplaceClient {
  constructor(nocodbClient, baseId, tableId) {
    this.nocodbClient = nocodbClient;
    this.baseId = baseId;
    this.tableId = tableId;
  }

  async list(params = {}) {
    return await this.nocodbClient.listRecords(this.tableId, params);
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
    return await this.nocodbClient.createRecords(this.tableId, data);
  }

  async update(id, data) {
    return await this.nocodbClient.updateRecords(this.tableId, { id, ...data });
  }

  async bulkUpdate(records) {
    return await this.nocodbClient.updateRecords(this.tableId, records);
  }
}

