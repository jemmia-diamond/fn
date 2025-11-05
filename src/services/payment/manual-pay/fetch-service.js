import { Prisma } from "@prisma/client";
import Database from "services/database";

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
      const paymentTypeCondition = paymentType === "cash"
        ? Prisma.sql`AND mp.payment_type = 'Tiền Mặt'`
        : Prisma.sql`AND mp.payment_type != 'Tiền Mặt'`;

      const results = await this.db.$queryRaw`
        SELECT
          mp.uuid, mp.haravan_order_name, mp.transfer_amount, mp.branch, mp.bank_name,
          mp.bank_account, mp.transfer_note, mp.created_date, mp.receive_date, mp.updated_date,
          -- haravan.orders fields
          ho.id as haravan_order_id,
          ho.name as haravan_order_name_from_order,
          ho.source, ho.gateway, ho.customer_id, ho.confirmed_at,
          ho.customer_last_name,
          ho.customer_first_name,
          ho.customer_default_address_address1,
          ho.customer_default_address_address2,
          ho.customer_default_address_ward,
          ho.customer_default_address_district,
          ho.customer_default_address_province,
          ho.customer_default_address_country,
          -- haravan.users fields
          hu.first_name as user_first_name,
          hu.last_name as user_last_name,
          -- misa.users fields
          mu.employee_code as misa_employee_code
        FROM payment.manual_payments mp
        LEFT JOIN haravan.orders ho ON mp.haravan_order_id = ho.id
        LEFT JOIN haravan.users hu ON ho.user_id = hu.id
        LEFT JOIN misa.users mu ON hu.id = mu.haravan_id
        WHERE mp.transfer_status = 'Xác nhận'
          AND mp.misa_synced = false
          AND ho.financial_status IN ('paid', 'partially_paid')
          AND mp.created_date >= ${startDate}
          AND mp.created_date <= ${endDate}
          ${paymentTypeCondition}
      `;

      return results.map(row => ({
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
          id: row.haravan_order_id,
          name: row.haravan_order_name_from_order,
          source: row.source,
          gateway: row.gateway,
          customer_id: row.customer_id,
          confirmed_at: row.confirmed_at,
          customer_last_name: row.customer_last_name,
          customer_first_name: row.customer_first_name,
          customer_default_address_address1: row.customer_default_address_address1,
          customer_default_address_address2: row.customer_default_address_address2,
          customer_default_address_ward: row.customer_default_address_ward,
          customer_default_address_district: row.customer_default_address_district,
          customer_default_address_province: row.customer_default_address_province,
          customer_default_address_country: row.customer_default_address_country,
          user: (row.user_first_name || row.user_last_name) ? {
            first_name: row.user_first_name,
            last_name: row.user_last_name,
            misa_user: row.misa_employee_code ? {
              employee_code: row.misa_employee_code
            } : null
          } : null
        }
      }));
    } catch (error) {
      throw new Error(`Could not fetch Manual payments from the database: ${error}`);
    }
  }
}
