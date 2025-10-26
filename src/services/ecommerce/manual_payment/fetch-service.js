import Database from "services/database";

export default class ManualPaymentFetchingService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  /**
   * Get Manual payments that is not synced to MISA (with startDate and endDate)
   * @returns manualPaymentTransaction[]
   */
  async byDateRangeAndNotSynced(startDate = null, endDate = null) {
    try {
      const manualPayments = await this.db.manualPaymentTransaction.findMany({
        where: {
          transfer_status: "Xác nhận",
          haravan_order: {
            financial_status: { in: ["paid", "partially_paid"] }
          },
          misa_synced: false,
          created_date: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          uuid: true,
          haravan_order_name: true,
          transfer_amount: true,
          branch: true,
          bank_name: true,
          bank_account: true,
          transfer_note: true,
          created_date: true,
          updated_date: true,
          haravan_order: {
            select: {
              id: true,
              name: true,
              source: true,
              gateway: true,
              customer_id: true,
              customer_last_name: true,
              customer_first_name: true,
              customer_default_address_address1: true,
              customer_default_address_address2: true,
              customer_default_address_ward: true,
              customer_default_address_district: true,
              customer_default_address_province: true,
              customer_default_address_country: true,
              misa_user: {
                select: {
                  employee_code: true
                }
              },
              user: {
                select: {
                  first_name: true,
                  last_name: true
                }
              }
            }
          }
        }
      });
      return manualPayments;
    } catch (error) {
      throw new Error("Could not fetch Manual generators from the database.", error);
    }
  }
}
