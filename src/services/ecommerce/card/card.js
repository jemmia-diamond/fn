import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";

export default class CardService {
  constructor(env) {
    this.db = Database.instance(env);
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
      Sentry.captureException(error);
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
      Sentry.captureException(error);
      throw new Error("Failed to read card");
    }
  }

  async update(customUuid, rawData) {
    try {
      const result = await this.db.$queryRaw`
        UPDATE ecom.leads
        SET raw_data = ${JSON.stringify(rawData)}
        WHERE custom_uuid = ${customUuid}
        RETURNING raw_data, custom_uuid;
      `;

      if (result.length === 0) {
        throw new Error("Lead not found for the given UUID");
      }
      return result[0];
    } catch (error) {
      Sentry.captureException(error);
      if (error.message.includes("Lead not found")) {
        throw error;
      }
      throw new Error("Failed to update lead");
    }
  }
}
