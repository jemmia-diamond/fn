import Database from "services/database";
import { Prisma } from "@prisma-cli";

export default class DatabaseFunctionService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  // Run each 3 hours
  static async runWorkplaceUpdateLastRfidScanTime(env) {
    const db = Database.instance(env);
    try {
      await db.$executeRaw`${Prisma.raw("DO $$ BEGIN PERFORM workplace.update_last_rfid_scan_time(); END $$;")}`;
    } catch (error) {
      console.error("Failed to run database function:", error);
    }
  }

}
