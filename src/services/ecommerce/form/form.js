import Database from "services/database";

export default class FormService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async create(rawData) {
    const result = await this.db.ecomLeads.create({
      data: {
        raw_data: rawData,
        source: rawData.source || "Website"
      },
      select: {
        custom_uuid: true,
        raw_data: true,
        source: true
      }
    });

    return result;
  }
}
