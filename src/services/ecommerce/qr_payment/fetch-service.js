import Database from "services/database";

export default class QrPaymentFetchingService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  /**
   * Get QR generators that is not synced to MISA (with startDate and endDate)
   * @returns qrPaymentTransaction[]
   */
  async byDateRangeAndNotSynced(startDate = null, endDate = null) {
    try {
      const qrGenerators = await this.db.$queryRaw`
        SELECT
          qr.id,
          qr.haravan_order_number,
          qr.transfer_amount,
          qr.bank_code,
          qr.bank_account_number,
          qr.customer_name,
          qr.transfer_note,
          qr.created_at,
          qr.updated_at,
          -- haravan order fields
          ho.id as haravan_order_id,
          ho.name as haravan_order_name,
          ho.source,
          ho.gateway,
          ho.customer_id,
          ho.customer_default_address_address1,
          ho.customer_default_address_address2,
          ho.customer_default_address_ward,
          ho.customer_default_address_district,
          ho.customer_default_address_province,
          ho.customer_default_address_country,
          -- misa user
          mu.employee_code as misa_employee_code,
          -- haravan user
          hu.first_name as user_first_name,
          hu.last_name as user_last_name
        FROM ecom.qr_generator qr
        LEFT JOIN haravan.orders ho ON qr.haravan_order_id = ho.id
        LEFT JOIN misa.users mu ON ho.user_id = mu.haravan_id
        LEFT JOIN haravan.users hu ON ho.user_id = hu.id
        WHERE qr.transfer_status = 'success'
          AND ho.financial_status IN ('paid', 'partially_paid')
          AND qr.misa_synced = false
          AND qr.updated_at >= ${startDate}
          AND qr.updated_at <= ${endDate}
      `;

      return qrGenerators.map(row => ({
        id: row.id,
        haravan_order_number: row.haravan_order_number,
        transfer_amount: row.transfer_amount,
        bank_code: row.bank_code,
        bank_account_number: row.bank_account_number,
        customer_name: row.customer_name,
        transfer_note: row.transfer_note,
        created_at: row.created_at,
        updated_at: row.updated_at,
        haravan_order: {
          id: row.haravan_order_id,
          name: row.haravan_order_name,
          source: row.source,
          gateway: row.gateway,
          customer_id: row.customer_id,
          customer_default_address_address1: row.customer_default_address_address1,
          customer_default_address_address2: row.customer_default_address_address2,
          customer_default_address_ward: row.customer_default_address_ward,
          customer_default_address_district: row.customer_default_address_district,
          customer_default_address_province: row.customer_default_address_province,
          customer_default_address_country: row.customer_default_address_country,
          misa_user: row.misa_employee_code ? {
            employee_code: row.misa_employee_code
          } : null,
          user: (row.user_first_name || row.user_last_name) ? {
            first_name: row.user_first_name,
            last_name: row.user_last_name
          } : null
        }
      }));
    } catch (error) {
      throw new Error("Could not fetch QR generators from the database.", error);
    }
  }
}
