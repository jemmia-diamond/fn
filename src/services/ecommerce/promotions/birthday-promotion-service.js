import * as Sentry from "@sentry/cloudflare";
import FrappeClient from "frappe/frappe-client";
import ZNSMessageService from "services/zalo-message/zalo-message";
import { ZALO_TEMPLATE } from "services/ecommerce/zalo-message/enums/zalo-template.enum";
import { GetTemplateZalo } from "services/ecommerce/zalo-message/utils/format-template-zalo";

export default class BirthdayPromotionService {
  constructor(env) {
    this.env = env;
  }

  async sendMonthlyBirthdayMessages() {
    try {
      const frappeClient = this._getFrappeClient();
      const currentMonth = new Date().getMonth() + 1;
      const monthString = currentMonth.toString().padStart(2, "0");

      let start = 0;
      const pageSize = 500;
      let hasMoreData = true;

      while (hasMoreData) {
        const customersBatch = await frappeClient.getList("Customer", {
          filters: [
            ["birth_date", "like", `%-${monthString}-%`],
            ["disabled", "=", 0]
          ],
          fields: ["name", "customer_name", "phone", "mobile_no", "birth_date"],
          limit_start: start,
          limit_page_length: pageSize
        });

        if (customersBatch && customersBatch.length > 0) {
          const eligibleCustomers = customersBatch.filter(c => c.phone || c.mobile_no);

          if (eligibleCustomers.length > 0) {
            await this._sendBirthdayMessagesToCustomers(eligibleCustomers);
          }

          hasMoreData = customersBatch.length === pageSize;
          start += pageSize;
        } else {
          hasMoreData = false;
        }
      }

    } catch (error) {
      Sentry.captureException(error);
    }
  }

  _getFrappeClient() {
    return new FrappeClient({
      url: this.env.JEMMIA_ERP_BASE_URL,
      apiKey: this.env.JEMMIA_ERP_API_KEY,
      apiSecret: this.env.JEMMIA_ERP_API_SECRET
    });
  }

  async _sendBirthdayMessagesToCustomers(customers) {
    const messageService = new ZNSMessageService(this.env);
    const templateId = ZALO_TEMPLATE.birthdayPromotion;

    for (const customer of customers) {
      try {
        const result = GetTemplateZalo.getTemplateZalo(templateId, customer);

        if (result && result.phone) {
          await messageService.sendMessage(result.phone, templateId, result.templateData);
        } else {
          console.warn(`Could not determine a valid phone number for customer: ${customer.name}`);
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
