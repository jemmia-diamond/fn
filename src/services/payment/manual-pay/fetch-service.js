import Database from "services/database";
import { Prisma } from "@prisma-cli";

export default class ManualPaymentFetchingService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  /**
   * Get Manual payments (cash) that are not synced to MISA (with startDate and endDate)
   * @returns manualPaymentTransaction[]
   */
  async byDateRangeAndNotSynced(startDate = null, endDate = null) {
    return this._fetchManualPaymentsWithJoins("cash", startDate, endDate);
  }

  /**
   * Get non-cash Manual payments that are not synced to MISA.
   * @returns manualPaymentTransaction[]
   */
  async fetchNonCashByDateRange(startDate = null, endDate = null) {
    return this._fetchManualPaymentsWithJoins("non-cash", startDate, endDate);
  }

  async _fetchManualPaymentsWithJoins(paymentType, startDate, endDate) {
    try {
      let payments;
      const selectClause = `
        SELECT
          mp.uuid,
          mp.haravan_order_name,
          mp.transfer_amount,
          mp.branch,
          mp.bank_name,
          mp.bank_account,
          mp.transfer_note,
          mp.created_date,
          mp.receive_date,
          mp.updated_date,
          -- Order fields
          ho.id as "order_id",
          ho.name as "order_name",
          ho.source as "order_source",
          ho.gateway as "order_gateway",
          ho.customer_id as "order_customer_id",
          ho.customer_last_name as "order_customer_last_name",
          ho.customer_first_name as "order_customer_first_name",
          ho.customer_default_address_address1 as "order_address1",
          ho.customer_default_address_address2 as "order_address2",
          ho.customer_default_address_ward as "order_ward",
          ho.customer_default_address_district as "order_district",
          ho.customer_default_address_province as "order_province",
          ho.customer_default_address_country as "order_country",
          -- Misa user
          mu.employee_code as "misa_employee_code",
          -- Haravan user
          hu.first_name as "user_first_name",
          hu.last_name as "user_last_name"
        FROM payment.manual_payments mp
        LEFT JOIN haravan.orders ho ON mp.haravan_order_id = ho.id
        LEFT JOIN misa.users mu ON ho.user_id = mu.haravan_id
        LEFT JOIN haravan.users hu ON ho.user_id = hu.id
      `;

      if (paymentType === "cash") {
        payments = await this.db.$queryRaw`
          ${Prisma.raw(selectClause)}
          WHERE mp.transfer_status = 'Xác nhận'
            AND ho.financial_status IN ('paid', 'partially_paid')
            AND mp.misa_synced = false
            AND mp.payment_type = 'Tiền Mặt'
            AND mp.created_date >= ${startDate}
            AND mp.created_date <= ${endDate}
        `;
      } else {
        payments = await this.db.$queryRaw`
          ${Prisma.raw(selectClause)}
          WHERE mp.transfer_status = 'Xác nhận'
            AND ho.financial_status IN ('paid', 'partially_paid')
            AND mp.misa_synced = false
            AND mp.payment_type != 'Tiền Mặt'
            AND mp.created_date >= ${startDate}
            AND mp.created_date <= ${endDate}
        `;
      }

      return this._mapPaymentsToNestedStructure(payments);
    } catch (error) {
      throw new Error(`Could not fetch Manual payments from the database: ${error.message || error}`);
    }
  }

  /**
   * Map flat SQL results to nested structure
   * @private
   */
  async _mapPaymentsToNestedStructure(payments) {
    return payments.map(row => ({
      uuid: row.uuid,
      haravan_order_name: row.haravan_order_name,
      transfer_amount: row.transfer_amount,
      branch: row.branch,
      bank_name: row.bank_name,
      bank_account: row.bank_account,
      transfer_note: row.transfer_note,
      created_date: row.created_date,
      receive_date: row.receive_date,
      updated_date: row.updated_date,
      haravan_order: {
        id: row.order_id,
        name: row.order_name,
        source: row.order_source,
        gateway: row.order_gateway,
        customer_id: row.order_customer_id,
        customer_last_name: row.order_customer_last_name,
        customer_first_name: row.order_customer_first_name,
        customer_default_address_address1: row.order_address1,
        customer_default_address_address2: row.order_address2,
        customer_default_address_ward: row.order_ward,
        customer_default_address_district: row.order_district,
        customer_default_address_province: row.order_province,
        customer_default_address_country: row.order_country,
        misa_user: row.misa_employee_code ? {
          employee_code: row.misa_employee_code
        } : null,
        user: (row.user_first_name || row.user_last_name) ? {
          first_name: row.user_first_name,
          last_name: row.user_last_name
        } : null
      }
    }));
  }
}
