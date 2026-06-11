import * as Sentry from "@sentry/cloudflare";
import FrappeClient from "src/frappe/frappe-client";
import { convertIsoToDatetime } from "src/frappe/utils/datetime";
import Database from "src/services/database";
import AddressService from "src/services/erp/contacts/address/address";
import ContactService from "src/services/erp/contacts/contact/contact";
import CustomerService from "src/services/erp/selling/customer/customer";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import {
  fetchSalesOrdersFromERP,
  saveSalesOrdersToDatabase,
  ensureSelfReference,
  getLeadSource,
  syncHaravanFinancialStatus
} from "src/services/erp/selling/sales-order/utils/sales-order-helpers";
import { getRefOrderChain } from "services/ecommerce/order-tracking/queries/get-initial-order";
import { isTestOrder } from "services/utils/order-intercepter";
import { sendSalesOrderNotificationToLark } from "services/erp/selling/sales-order/utils/sales-order-lark-notifier";

dayjs.extend(utc);

export default class SalesOrderService {
  static ERPNEXT_PAGE_SIZE = 100;
  static SYNC_TYPE_AUTO = 1; // auto sync when deploy app
  static SYNC_TYPE_MANUAL = 0; // manual sync when call function
  static PAYMENT_GATEWAY_ERP = "Thanh toán qua ERP";

  constructor(env) {
    this.env = env;
    this.doctype = "Sales Order";
    this.linkedTableDoctype = {
      lineItems: "Sales Order Item",
      paymentRecords: "Sales Order Payment Record",
      refSalesOrder: "Ref Sales Order"
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
    this.carrierStatusMapper = {
      notdelivered: "Not Delivered",
      readytopick: "Ready To Pick",
      delivering: "Delivering",
      delivered: "Delivered"
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
    if (isTestOrder(haravanOrderData)){
      return true;
    }

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

    const websiteDefaultFirstSource = await getLeadSource(this.frappeClient, haravanOrderData.source);
    const customer = await customerService.processHaravanCustomer(
      haravanOrderData.customer,
      contact,
      customerDefaultAdress,
      { websiteDefaultFirstSource }
    );

    // Update the customer back to his contact and address
    await contactService.processHaravanContact(haravanOrderData.customer, customer);
    await addressService.processHaravanAddress(haravanOrderData.billing_address, customer);
    for (const address of haravanOrderData.customer.addresses) {
      await addressService.processHaravanAddress(address, customer);
    }

    const paymentTransactions = haravanOrderData.transactions.filter(transaction => ["capture", "authorization"].includes(transaction.kind.toLowerCase()));

    const discountCodes = haravanOrderData.discount_codes || [];
    const couponCode = discountCodes.map(item => item.code).join("\n");

    const fulfillmentsList = haravanOrderData?.fulfillments || [];
    const latestFulfillment = fulfillmentsList[fulfillmentsList.length - 1] || {};
    const trackingNumber = latestFulfillment.tracking_number;

    const mappedOrderData = {
      doctype: this.doctype,
      customer: customer.name,
      order_number: haravanOrderData.order_number,
      haravan_order_id: String(haravanOrderData.id),
      haravan_ref_order_id: String(haravanOrderData.ref_order_id),
      source_name: haravanOrderData.source_name,
      discount_amount: haravanOrderData.total_discounts,
      ...(couponCode && { haravan_coupon_code: couponCode }),
      items: haravanOrderData.line_items.map(this.mapLineItemsFields),
      skip_delivery_note: 1,
      financial_status: this.financialStatusMapper[haravanOrderData.financial_status],
      fulfillment_status: this.fulfillmentStatusMapper[haravanOrderData.fulfillment_status],
      fulfillment_completion_date: haravanOrderData.fulfillments.length && haravanOrderData.fulfillments[0].delivered_date ? dayjs(haravanOrderData.fulfillments[0].delivered_date).utc().format("YYYY-MM-DD HH:mm:ss") : null,
      cancelled_status: this.cancelledStatusMapper[haravanOrderData.cancelled_status],
      carrier_status: haravanOrderData.fulfillments.length ? this.carrierStatusMapper[haravanOrderData.fulfillments[0].carrier_status_code] : this.carrierStatusMapper.notdelivered,
      transaction_date: dayjs(haravanOrderData.created_at).utc().add(7, "hour").format("YYYY-MM-DD"),
      haravan_created_at: convertIsoToDatetime(haravanOrderData.created_at, "datetime"),
      total: haravanOrderData.total_line_items_price,
      payment_records: paymentTransactions.map(this.mapPaymentRecordFields),
      contact_person: contact.name,
      customer_address: customerDefaultAdress.name,
      total_amount: haravanOrderData.total_price,
      grand_total: haravanOrderData.total_price,
      real_order_date: await this.getRealOrderDate(haravanOrderData.id) || dayjs(haravanOrderData.created_at).utc().add(7, "hour").format("YYYY-MM-DD"),
      ref_sales_orders: await this.fetchAndMapSalesOrderReferences(haravanOrderData.id),
      tracking_number: trackingNumber
    };
    const order = await this.frappeClient.upsert(mappedOrderData, "haravan_order_id", ["items"]);

    await ensureSelfReference(this.frappeClient, order, this.doctype);

    return order;
  }

  static async dequeueOrderQueue(batch, env) {
    const salesOrderService = new SalesOrderService(env);
    const messages = batch.messages;
    for (const message of messages) {
      const salesOrderData = message.body;
      await salesOrderService.processHaravanOrder(salesOrderData);
    }
  }

  static async dequeueSalesOrderNotificationQueue(batch, env) {
    const salesOrderService = new SalesOrderService(env);
    for (const message of batch.messages) {
      const orderData = message.body;
      await salesOrderService.sendNotificationToLark(orderData, true);
      await salesOrderService.syncHaravanFinancialStatus(orderData);
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

  fetchAndMapSalesOrderReferences = async (refOrderId) => {
    try {
      const refOrders = await getRefOrderChain(this.db, Number(refOrderId), true);

      if (!refOrders) {
        return [];
      };

      const erpRefOrders = await this.frappeClient.getList("Sales Order", {
        filters: [["haravan_order_id", "in", refOrders.map(order => String(order.id))]],
        fields: ["name", "haravan_order_id"]
      });

      return refOrders.map((o) => {
        const refOrder = erpRefOrders.find(order => String(order.haravan_order_id) === String(o.id));

        if (!refOrder) {
          return null;
        }

        return {
          doctype: "Sales Order Reference",
          sales_order: refOrder.name
        };
      }).filter(order => order !== null);
    } catch (e) {
      Sentry.captureException(e);
      return [];
    }
  };

  getRealOrderDate = async (orderId) => {
    const refOrders = await getRefOrderChain(this.db, Number(orderId), true);

    if (!refOrders || refOrders.length === 0) {
      return null;
    }

    // getRefOrderChain returns orders sorted by created_at ASC, so the first one is the original order
    const firstOrder = refOrders[0];
    return dayjs(firstOrder.created_at).utc().add(7, "hour").format("YYYY-MM-DD");
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
      rate: parseInt(lineItemData.price),
      type: lineItemData.type
    };
  };

  async sendNotificationToLark(orderData, isUpdateMessage = false) {
    return sendSalesOrderNotificationToLark(this.frappeClient, this.db, this.env, orderData, isUpdateMessage);
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
      Sentry.captureException(error);
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

  static async fillSerialNumbersToTemporaryOrderItems(env) {
    const salesOrderService = new SalesOrderService(env);

    const data = await salesOrderService.db.$queryRaw`
      SELECT
      so.name,
      jsonb_agg(
      	COALESCE(jsonb_set(li, '{serial_numbers}', to_jsonb(vs.serial_number::text), true), li.value)
      ) AS items
      FROM erpnext.sales_orders so
      	CROSS JOIN LATERAL jsonb_array_elements(so.items ) AS li
      	LEFT JOIN workplace.temporary_products tp ON li->>'haravan_variant_id' = tp.haravan_variant_id::TEXT
      	LEFT JOIN workplace.variant_serials vs ON tp.variant_serial_id = vs.id
      WHERE 1 = 1
      AND so.haravan_order_id IN (
      	SELECT
      		so.haravan_order_id
      	FROM erpnext.sales_orders so
      	CROSS JOIN LATERAL jsonb_array_elements(so.items) AS li
      	WHERE li->>'serial_numbers' IS NULL AND li->>'sku' LIKE 'SPT%' AND so.cancelled_status = 'Uncancelled'
      )
      GROUP BY so."name"
      ORDER BY so."name"
    `;

    for (const order of data) {
      try {
        await salesOrderService.frappeClient.update({
          doctype: salesOrderService.doctype,
          name: order.name,
          items: order.items
        });
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  async syncHaravanFinancialStatus(salesOrderData) {
    return syncHaravanFinancialStatus(this.env, salesOrderData);
  }
}
