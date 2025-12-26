import Database from "services/database";
import { Prisma } from "@prisma-cli";
import * as Sentry from "@sentry/cloudflare";

export default class MaterializedViewService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  // Refresh each 20 minutes
  static async refresh20Minutes(env) {
    const db = Database.instance(env);
    const views = [
      "reporting.line_item_view",
      "reporting.sales_team_view",
      "reporting.sales_order_dim",
      "reporting.order_line_item_dim",
      "reporting.order_sales_team_dim",
      "reporting.product_warehouse_stock_view",
      "reporting.order_promotion_view",
      "reporting.item_promotion_view",
      "reporting.serial_order_view",
      "reporting.debt_history_view"
    ];
    for (const view of views) {
      try {
        await db.$queryRaw`${Prisma.raw(`REFRESH MATERIALIZED VIEW ${view};`)}`;
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  // Refresh each 30 minutes
  static async refresh30Minutes(env) {
    const db = Database.instance(env);
    const views = [
      "crm_dashboard.crm_leads_view",
      "reporting.policy_rule_materials",
      "reporting.accounting_pending_orders_view"
    ];
    for (const view of views) {
      try {
        await db.$queryRaw`${Prisma.raw(`REFRESH MATERIALIZED VIEW ${view};`)}`;
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  // Refresh each 3 hours
  static async refresh3Hours(env) {
    const db = Database.instance(env);
    const views = [
      "marketing.lead_contact_conversion_customer_order_view"
    ];
    for (const view of views) {
      try {
        await db.$queryRaw`${Prisma.raw(`REFRESH MATERIALIZED VIEW ${view};`)}`;
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
