import FrappeClient from "src/frappe/frappe-client";
import { convertIsoToDatetime } from "src/frappe/utils/datetime";
import LarksuiteService from "services/larksuite/lark";
import Database from "src/services/database";
import AddressService from "src/services/erp/contacts/address/address";
import ContactService from "src/services/erp/contacts/contact/contact";
import CustomerService from "src/services/erp/selling/customer/customer";
import { composeSalesOrderNotification, extractPromotions, validateOrderInfo } from "services/erp/selling/sales-order/utils/sales-order-notification";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { CHAT_GROUPS} from "services/larksuite/group-chat/group-management/constant";

import { fetchSalesOrdersFromERP, saveSalesOrdersToDatabase } from "src/services/erp/selling/sales-order/utils/sales-order-helpers";

dayjs.extend(utc);

export default class SalesOrderService {
  static ERPNEXT_PAGE_SIZE = 100;
  static SYNC_TYPE_AUTO = 1; // auto sync when deploy app
  static SYNC_TYPE_MANUAL = 0; // manual sync when call function

  constructor(env) {
    this.env = env;
    this.doctype = "Sales Order";
    this.linkedTableDoctype = {
      lineItems: "Sales Order Item",
      paymentRecords: "Sales Order Payment Record"
    };
    this.cancelledStatusMapper = {
      uncancelled: "Uncancelled",
      cancelled: "Cancelled"
    };
    this.fulfillmentStatusMapper = {
      fulfilled: "Fulfilled",
      notfulfilled: "Not Fulfilled"
    };
    this.financialStatusMapper = {
      paid: "Paid",
      partially_paid: "Partially Paid",
      partially_refunded: "Partially Refunded",
      refunded: "Refunded",
      pending: "Pending"
    };
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.db = Database.instance(env);
  };

  async processHaravanOrder(haravanOrderData) {
    // Initialize services
    const addressService = new AddressService(this.env);
    const contactService = new ContactService(this.env);
    const customerService = new CustomerService(this.env);

    // Create billing address and customer's addresses
    await addressService.processHaravanAddress(haravanOrderData.billing_address);
    let customerAddresses = [];
    for (const address of haravanOrderData.customer.addresses) {
      customerAddresses.push(await addressService.processHaravanAddress(address));
    }
    const customerDefaultAdress = customerAddresses[0];

    // Create contact and customer with default address
    const contact = await contactService.processHaravanContact(haravanOrderData.customer);
    const customer = await customerService.processHaravanCustomer(haravanOrderData.customer, contact, customerDefaultAdress);

    // Update the customer back to his contact and address
    await contactService.processHaravanContact(haravanOrderData.customer, customer);
    await addressService.processHaravanAddress(haravanOrderData.billing_address, customer);
    for (const address of haravanOrderData.customer.addresses) {
      await addressService.processHaravanAddress(address, customer);
    }

    const paymentTransactions = haravanOrderData.transactions.filter(transaction => transaction.kind.toLowerCase() === "capture");
    const paidAmount = paymentTransactions.reduce((total, transaction) => total + transaction.amount, 0);

    const mappedOrderData = {
      doctype: this.doctype,
      customer: customer.name,
      order_number: haravanOrderData.order_number,
      haravan_order_id: String(haravanOrderData.id),
      haravan_ref_order_id: String(haravanOrderData.ref_order_id),
      source_name: haravanOrderData.source_name,
      discount_amount: haravanOrderData.total_discounts,
      items: haravanOrderData.line_items.map(this.mapLineItemsFields),
      skip_delivery_note: 1,
      financial_status: this.financialStatusMapper[haravanOrderData.financial_status],
      fulfillment_status: this.fulfillmentStatusMapper[haravanOrderData.fulfillment_status],
      cancelled_status: this.cancelledStatusMapper[haravanOrderData.cancelled_status],
      transaction_date: convertIsoToDatetime(haravanOrderData.created_at, "date"),
      haravan_created_at: convertIsoToDatetime(haravanOrderData.created_at, "datetime"),
      total: haravanOrderData.total_line_items_price,
      payment_records: haravanOrderData.transactions.filter(transaction => transaction.kind.toLowerCase() === "capture").map(this.mapPaymentRecordFields),
      contact_person: contact.name,
      customer_address: customerDefaultAdress.name,
      total_amount: haravanOrderData.total_price,
      grand_total: haravanOrderData.total_price,
      paid_amount: paidAmount,
      balance: haravanOrderData.total_price - paidAmount
    };
    const order = await this.frappeClient.upsert(mappedOrderData, "haravan_order_id", ["items"]);
    return order;
  }

  static async dequeueOrderQueue(batch, env) {
    const salesOrderService = new SalesOrderService(env);
    const messages = batch.messages;
    for (const message of messages) {
      const salesOrderData = message.body;
      try {
        await salesOrderService.processHaravanOrder(salesOrderData);
      } catch (error) {
        console.error(error);
      }
    }
  }

  mapPaymentRecordFields = (hrvTransactionData) => {
    return {
      doctype: this.linkedTableDoctype.paymentRecords,
      date: convertIsoToDatetime(hrvTransactionData["created_at"]),
      amount: hrvTransactionData["amount"],
      gateway: hrvTransactionData["gateway"],
      kind: hrvTransactionData["kind"],
      transaction_id: hrvTransactionData["id"]
    };
  };

  mapLineItemsFields = (lineItemData) => {
    return {
      doctype: this.linkedTableDoctype.lineItems,
      haravan_variant_id: lineItemData.variant_id,
      item_name: lineItemData.title,
      variant_title: lineItemData.variant_title,
      sku: lineItemData.sku,
      barcode: lineItemData.barcode,
      qty: lineItemData.quantity,
      price_list_rate: parseInt(lineItemData.price_original),
      discount_amount: parseInt(lineItemData.price_original - lineItemData.price),
      rate: parseInt(lineItemData.price)
    };
  };

  async sendNotificationToLark(salesOrderData) {
    const larkClient = LarksuiteService.createClient(this.env);

    const notificationTracking = await this.db.erpnextSalesOrderNotificationTracking.findFirst({
      where: {
        order_name: salesOrderData.name
      }
    });

    if (notificationTracking) {
      return { success: false, message: "Đơn hàng này đã được gửi thông báo từ trước đó!" };
    }

    const { isValid, message } = validateOrderInfo(salesOrderData);
    if (!isValid) {
      return { success: false, message: message };
    }

    const promotionNames = extractPromotions(salesOrderData);
    const promotionData = await this.frappeClient.getList("Promotion", {
      filters: [["name", "in", promotionNames]]
    });
    const content = composeSalesOrderNotification(salesOrderData, promotionData);

    const _response = await larkClient.im.message.create({
      params: {
        receive_id_type: "chat_id"
      },
      data: {
        receive_id: CHAT_GROUPS.SUPPORT_ERP.chat_id,
        msg_type: "text",
        content: JSON.stringify({
          text: content
        })
      }
    });

    const messageId = _response.data.message_id;

    await this.db.erpnextSalesOrderNotificationTracking.create({
      data: {
        lark_message_id: messageId,
        order_name: salesOrderData.name,
        haravan_order_id: salesOrderData.haravan_order_id
      }
    });

    return { success: true, message: "Đã gửi thông báo thành công!" };
  }

  async syncSalesOrdersToDatabase(options = {}) {
    // minutesBack = 10 is default value for first sync when no create kv
    const { isSyncType = SalesOrderService.SYNC_TYPE_MANUAL, minutesBack = 10 } = options;
    const kv = this.env.FN_KV;
    const KV_KEY = "sales_order_sync:last_date";
    const toDate = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    let fromDate;

    if (isSyncType === SalesOrderService.SYNC_TYPE_AUTO) {
      const lastDate = await kv.get(KV_KEY);
      fromDate = lastDate || dayjs().utc().subtract(minutesBack, "minutes").format("YYYY-MM-DD HH:mm:ss"); // first time when deploy app, we need define fromDate, if not, we will get all data from ERP
    } else {
      fromDate = dayjs().utc().subtract(minutesBack, "minutes").format("YYYY-MM-DD HH:mm:ss");
    }

    try {
      const salesOrders = await fetchSalesOrdersFromERP(this.frappeClient, this.doctype, fromDate, toDate, SalesOrderService.ERPNEXT_PAGE_SIZE);
      if (Array.isArray(salesOrders) && salesOrders.length > 0) {
        await saveSalesOrdersToDatabase(this.db, salesOrders);
      }
      if (isSyncType === SalesOrderService.SYNC_TYPE_AUTO) {
        await kv.put(KV_KEY, toDate);
      }
    } catch (error) {
      console.error("Error syncing sales orders to database:", error.message);
      // Handle when cronjon failed in 1 hour => we need to update the last date to the current date
      if (isSyncType === SalesOrderService.SYNC_TYPE_AUTO && dayjs(toDate).diff(dayjs(await kv.get(KV_KEY)), "hour") >= 1) {
        await kv.put(KV_KEY, toDate);
      }
    }
  };

  static async cronSyncSalesOrdersToDatabase(env) {
    const syncService = new SalesOrderService(env);
    return await syncService.syncSalesOrdersToDatabase({
      minutesBack: 10,
      isSyncType: SalesOrderService.SYNC_TYPE_AUTO
    });
  }

  static async fillSalesOrderRealDate(env) {
    const salesOrderService = new SalesOrderService(env);
    const salesOrders = [];
    try {
      const orders = await salesOrderService.frappeClient.getList("Sales Order", {
        filters: [
          ["real_order_date", "is", "not set"],
          ["cancelled_status", "=", "uncancelled"]
        ]
      });
      salesOrders.push(...orders);
    } catch (error) {
      console.error(error);
      return;
    }

    for (const salesOrder of salesOrders) {
      const haravanId = Number(salesOrder.haravan_order_id);

      const orderChain = await salesOrderService.db.$queryRaw`
        WITH RECURSIVE order_chain AS (
	        SELECT id, ref_order_id 
	        FROM haravan.orders 
	        WHERE id = ${haravanId}
	        UNION ALL 
	        SELECT o.id, o.ref_order_id
	        FROM haravan.orders o
	        	INNER JOIN order_chain oc ON o.id = oc.ref_order_id
        )
        SELECT 
        o.id ,
        o.order_number ,
        o.created_at 
        FROM haravan.orders o 
        WHERE o.id IN (
        	SELECT id FROM order_chain
        )
        ORDER BY o.created_at ASC
      `;
      const firstOfChain = orderChain[0];
      const realOrderDate = dayjs(firstOfChain.created_at).utc().format("YYYY-MM-DD");
      try {
        await salesOrderService.frappeClient.update(
          {
            doctype: "Sales Order",
            name: salesOrder.name,
            real_order_date: realOrderDate
          }
        );
      } catch (error) {
        console.error(error);
      }
    }
  }
}
