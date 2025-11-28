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
    const whereCondition = {
      transfer_status: "Xác nhận",
      misa_synced: false,
      created_date: {
        gte: startDate,
        lte: endDate
      },
      payment_type: paymentType === "cash" ? "Tiền Mặt" : { not: "Tiền Mặt" },
      haravan_order: {
        financial_status: {
          in: ["paid", "partially_paid"]
        }
      }
    };

    return await this.db.manualPaymentTransaction.findMany({
      where: whereCondition,
      select: this.misaRequiredFields()
    });
  }

  misaRequiredFields() {
    return {
      uuid: true,
      haravan_order_name: true,
      transfer_amount: true,
      payment_type: true,
      branch: true,
      bank_name: true,
      bank_account: true,
      transfer_note: true,
      created_date: true,
      receive_date: true,
      updated_date: true,
      haravan_order_id: true,
      misa_sync_guid: true,
      misa_synced_at: true,
      haravan_order: {
        select: {
          id: true,
          name: true,
          source: true,
          gateway: true,
          customer_id: true,
          confirmed_at: true,
          customer_last_name: true,
          customer_first_name: true,
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
