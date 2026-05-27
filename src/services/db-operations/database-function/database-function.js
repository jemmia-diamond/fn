import * as Sentry from "@sentry/cloudflare";
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
      Sentry.captureException(error);
    }
  }

  // Run every 3 hours
  static async runUpdateOrderReferencesInVariantSerials(env) {
    const db = Database.instance(env);
    try {
      await db.$executeRaw`${Prisma.raw("SELECT workplace.update_order_references_in_variant_serials();")}`;
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
