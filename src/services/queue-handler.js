/* eslint no-console: "off" */

import ERP from "src/services/erp";
import Pancake from "src/services/pancake";
import ProductQuote from "src/services/product_quote";
import Ecommerce from "src/services/ecommerce";
import Haravan from "src/services/haravan";
import Misa from "src/services/misa";

export default {
  queue: async (batch, env) => {
    console.log(`[CLOUDFLARE DEQUEUING]: ${JSON.stringify(batch)}`);

    switch (batch.queue) {
    case "order":
      await Ecommerce.OrderNotificationService.orderNotificationDequeue(batch, env);
      await Haravan.OrderModule.OrderService.dequeueOrderQueue(batch, env);
      await ProductQuote.ProductQuoteOrderService.dequeueOrderQueue(batch, env);
      break;
    case "message":
      await Pancake.ConversationService.dequeueMessageSyncCustomerToLeadCRM(batch, env);
      break;
    case "message-extra-hooks":
      await Pancake.ConversationService.dequeueExtraHooksQueue(batch, env);
      break;
    case "message-summary":
      await Pancake.ConversationService.dequeueMessageSummaryQueue(batch, env);
      break;
    case "message-last-customer":
      await Pancake.ConversationService.dequeueMessageLastCustomerQueue(batch, env);
      break;
    case "zalo-message":
      await Ecommerce.SendZaloMessage.dequeueSendZaloDeliveryMessageQueue(batch, env);
      await Ecommerce.SendZaloMessage.dequeueSendZaloConfirmMessageQueue(batch, env);
      await Ecommerce.SendZaloMessage.dequeueSendZaloRemindPayMessageQueue(batch, env);
      break;
    case "erpnext-contacts":
      await ERP.Contacts.ContactService.dequeueContactQueue(batch, env);
      break;
    case "erpnext-sales-order":
      await ERP.Selling.SalesOrderService.dequeueSalesOrderNotificationQueue(batch, env);
      break;
    case "misa":
      await new Misa.MisaWebhookHandler(env).dequeueCallbackPayloadQueue(batch);
      break;
    case "erpnext-payment-entry":
      await ERP.Accounting.PaymentEntryService.dequeuePaymentEntryQueue(batch, env);
      break;
    case "sepay-transaction":
      await ERP.Accounting.SepayTransactionService.dequeueSaveToDb(batch, env);
      await ERP.Accounting.SepayTransactionService.dequeueSepayTransactionQueue(batch, env);
      break;
    case "haravan-product":
      await Promise.allSettled([
        await Haravan.Product.ProductVariantService.dequeueProductQueue(batch, env),
        await Haravan.Product.AutoAddToDiscountProgramService.dequeueProductQueue(batch, env)
      ]);
      break;
    case "noco-collect":
      await Haravan.Collect.CollectService.dequeueCollectQueue(batch, env);
      break;
    case "erpnext-selling":
      const sellingMsg = batch.messages[0]?.body;
      if (sellingMsg?.doctype === "SalesOrderItem" || sellingMsg?.erpTopic === "update-sales-order-item") {
        await new ERP.Selling.SalesOrderItemService(env).dequeueSalesOrderItemQueue(batch);
      } else {
        await new ERP.Selling.CustomerService(env).dequeueCustomerQueue(batch);
      }
      break;
    case "erpnext-order-creation":
      await ERP.Selling.SalesOrderService.dequeueOrderQueue(batch, env);
      break;
    default:
      break;
    }
  }
};
