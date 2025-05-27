import frappeClient from "../../frappe/frappe-client";
import addressService from "./address";
import contactService from "./contact";
import customerService from "./customer";


export default class orderService {
    constructor(env) {
        this.env = env;
        this.frappeClient = new frappeClient(
            {
                url: env.JEMMIA_ERP_BASE_URL,
                apiKey: env.JEMMIA_ERP_API_KEY,
                apiSecret: env.JEMMIA_ERP_API_SECRET
            }
        );
    };

    async processHaravanOrder(haravanOrderData) {
        // Initialize services
        const addressSer = new addressService(this.env);
        const contactSer = new contactService(this.env);
        const customerSer = new customerService(this.env);

        const billingAddress = await addressSer.processHaravanAddress(haravanOrderData.billing_address);
        const customerAddresses = await Promise.all(haravanOrderData.customer.addresses.map(address => addressSer.processHaravanAddress(address)));
        const customerDefaultAdress = customerAddresses[0]

        const contact = await contactSer.processHaravanContact(haravanOrderData.customer, undefined, customerDefaultAdress);
        const customer = await customerSer.processHaravanCustomer(haravanOrderData.customer, contact, customerDefaultAdress);

        await addressSer.processHaravanAddress(haravanOrderData.billing_address, customer);
        await Promise.all(haravanOrderData.customer.addresses.map(address => addressSer.processHaravanAddress(address, customer)));

        const mappedOrderData = {
            doctype: "Sales Order",
            customer: customer.name,
            order_number: haravanOrderData.order_number,
            haravan_order_id: String(haravanOrderData.id),
            haravan_ref_order_id: String(haravanOrderData.ref_order_id),
            source_name: haravanOrderData.source_name,
            discount_amount: haravanOrderData.total_discounts,
            items: haravanOrderData.line_items.map(lineItemsFieldsMapper),
            skip_delivery_note: 1,
            financial_status: financialStatusMapper[haravanOrderData.financial_status],
            fulfillment_status: fulfillmentStatusMapper[haravanOrderData.fulfillment_status],
            cancelled_status: cancelledStatusMapper[haravanOrderData.cancelled_status],
            transaction_date: formatDate(haravanOrderData.created_at),
            haravan_created_at: formatDate(haravanOrderData.created_at, "datetime"),
            total: haravanOrderData.total_line_items_price,
            payment_records: haravanOrderData.transactions.filter(transaction => transaction.kind === "capture").map(paymentRecordFieldsMapper),
            contact_person: contact.name,
            customer_address: customerDefaultAdress.name
        }
        const order = await this.frappeClient.upsert(mappedOrderData, "haravan_order_id");
        return order;
    }

    static async decodeOrderQueue(batch, env) {
        const orderSer = new orderService(env);
        const messages = batch.messages;
        for (const message of messages) {
            const orderData = JSON.parse(message.body.body);
            await orderSer.processHaravanOrder(orderData);
        }
    }
}


const cancelledStatusMapper = {
    uncancelled: "Uncancelled",
    cancelled: "Cancelled"
};


const fulfillmentStatusMapper = {
    fulfilled: "Fulfilled",
    notfulfilled: "Not Fulfilled"
};


const financialStatusMapper = {
    paid: "Paid",
    partially_paid: "Partially Paid",
    partially_refunded: "Partially Refunded",
    refunded: "Refunded",
    pending: "Pending"
};


function lineItemsFieldsMapper(lineItemData) {
    return {
        doctype: "Sales Order Item",
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


function paymentRecordFieldsMapper(hrvTransactionData) {
    return {
        doctype: "Sales Order Payment Record",
        date: formatDate(hrvTransactionData["created_at"]),
        amount: hrvTransactionData["amount"],
        gateway: hrvTransactionData["gateway"],
        kind: hrvTransactionData["kind"],
        transaction_id: hrvTransactionData["id"]
    };
};


function formatDate(isoString, type = "date") {
    if (!isoString || typeof isoString !== "string") return null;
    // Remove all unnecessary spaces
    const cleaned = isoString.replace(/\s+/g, "");
    const date = new Date(cleaned);
    if (isNaN(date)) {
        console.error("Invalid date:", isoString);
        return null;
    }
    if (type === "date")
        return date.toISOString().split("T")[0];

    const pad = (num, size = 2) => String(num).padStart(size, '0');
    const padMicro = (num) => String(num).padEnd(6, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = padMicro(date.getMilliseconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};
