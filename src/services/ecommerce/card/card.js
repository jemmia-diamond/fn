import Database from "services/database";

export default class CardService {
  constructor(env) {
    this.db = Database.instance(env, "neon");
  }

  async create(rawData) {
    try {
      const result = await this.db.$queryRaw`
        INSERT INTO ecom.leads (raw_data)
        VALUES (${JSON.stringify(rawData)})
        RETURNING custom_uuid, raw_data;
      `;
      return result[0];
    } catch (error) {
      console.error("Error creating lead:", error);
      throw new Error("Failed to create lead");
    }
  }

  async readById(customUuid) {
    try {
      const result = await this.db.$queryRaw`
        SELECT raw_data, custom_uuid
        FROM ecom.leads
        WHERE custom_uuid = ${customUuid};
      `;
      if (result.length === 0) {
        throw new Error("Card not found");
      }
      return result[0];
    } catch (error) {
      console.error("Error reading card:", error);
      throw new Error("Failed to read card");
    }
  }
}
