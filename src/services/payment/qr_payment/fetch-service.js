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
    return await this.db.qrPaymentTransaction.findMany({
      where: {
        transfer_status: "success",
        haravan_order: {
          financial_status: { in: ["paid", "partially_paid"] }
        },
        misa_synced: false,
        misa_sync_guid: null,
        misa_synced_at: null,
        payment_entry_name: null,
        haravan_order_id: {
          not: null
        },
        haravan_order_number: {
          not: "ORDERLATER"
        },
        updated_at: {
          gte: startDate,
          lte: endDate
        }
      },
      select: this.misaRequiredFields()
    });
  }

  misaRequiredFields() {
    return {
      id: true,
      haravan_order_number: true,
      transfer_amount: true,
      bank_code: true,
      bank_account_number: true,
      customer_name: true,
      transfer_note: true,
      created_at: true,
      updated_at: true,
      haravan_order_id: true,
      misa_sync_guid: true,
      misa_synced_at: true,
      payment_entry_name: true,
      haravan_order: {
        select: {
          id: true,
          name: true,
          source: true,
          gateway: true,
          customer_id: true,
          confirmed_at: true,
          customer_default_address_address1: true,
          customer_default_address_address2: true,
          customer_default_address_ward: true,
          customer_default_address_district: true,
          customer_default_address_province: true,
          customer_default_address_country: true,
          ref_order_id: true,
          user: {
            select: {
              first_name: true,
              last_name: true,
              misa_user: {
                select: {
                  employee_code: true,
                  email: true
                }
              }
            }
          }
        }
      }
    };
  }
}
