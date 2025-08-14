import FrappeClient from "src/frappe/frappe-client";
import { convertIsoToDatetime } from "src/frappe/utils/datetime";

import AddressService from "src/services/erp/contacts/address/address";
import ContactService from "src/services/erp/contacts/contact/contact";
import CustomerService from "src/services/erp/selling/customer/customer";
import ZNSMessageService from "src/services/zalo-message/zalo-message"

export default class SalesOrderService {
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
      await salesOrderService.processHaravanOrder(salesOrderData);
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

  async sendConfirmedMessage(haravanOrderData){
    const phone = haravanOrderData.customer.phone;
    const templateId = 476840;
    const templateData = {
      order_number: haravanOrderData.order_number,
      price: haravanOrderData.total_price,
    };
    const messageService = new ZNSMessageService(this.env);
    return await messageService.sendMessage(phone, templateId, templateData);
  }
}
