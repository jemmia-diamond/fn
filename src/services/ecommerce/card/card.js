import Database from "services/database";

export default class CardService {
  constructor(env) {
    this.db = Database.instance(env, "neon");
  }

  async create(rawData) {
    try {
      const query = `
        INSERT INTO ecom.leads (raw_data)
        VALUES ($1)
        RETURNING id, custom_uuid, database_created_at;
      `;
      const values = [rawData];
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating card:", error);
      throw new Error("Failed to create card");
    }
  }

  async readById(customUuid) {
    try {
      const query = `
        SELECT id, raw_data, custom_uuid, database_created_at
        FROM ecom.leads
        WHERE custom_uuid = $1;
      `;
      const values = [customUuid];
      const result = await this.db.query(query, values);
      if (result.rows.length === 0) {
        throw new Error("Card not found");
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error reading card:", error);
      throw new Error("Failed to read card");
    }
  }

  async update(customUuid, rawData) {
    try {
      const query = `
        UPDATE ecom.leads
        SET raw_data = $1
        WHERE custom_uuid = $2
        RETURNING id, raw_data, custom_uuid, database_created_at;
      `;
      const values = [rawData, customUuid];
      const result = await this.db.query(query, values);
      if (result.rows.length === 0) {
        throw new Error("Card not found");
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error updating card:", error);
      throw new Error("Failed to update card");
    }
  }
}
