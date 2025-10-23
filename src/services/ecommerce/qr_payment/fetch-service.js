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
  async byDateRangeAndNotSyncedAndNotSynced(startDate = null, endDate = null) {
    try {
      const qrGenerators = await this.db.qrPaymentTransaction.findMany({
        where: {
          transfer_status: "success",
          haravan_order_status: {
            not: "Chờ xác nhận"
          },
          misa_synced: false,
          created_at: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          haravan_order_number: true,
          transfer_amount: true,
          bank_code: true,
          bank_account_number: true,
          customer_name: true,
          transfer_note: true,
          created_at: true,
          updated_at: true,
          haravan_order: {
            select: {
              id: true,
              name: true,
              source: true,
              gateway: true,
              customer_id: true,
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
      return qrGenerators;
    } catch (error) {
      throw new Error("Could not fetch QR generators from the database.", error);
    }
  }
}
