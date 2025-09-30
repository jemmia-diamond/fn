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
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";

import { fetchSalesOrdersFromERP, saveSalesOrdersToDatabase } from "src/services/erp/selling/sales-order/utils/sales-order-helpers";
import { Prisma } from "@prisma-cli";
import { stringSquish } from "services/utils/string-helper";
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
      carrier_status: haravanOrderData.fulfillments.length ? this.carrierStatusMapper[haravanOrderData.fulfillments[0].carrier_status_code] : this.carrierStatusMapper.notdelivered,
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
      rate: parseInt(lineItemData.price),
      type: lineItemData.type
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

    const customer = await this.frappeClient.getDoc("Customer", salesOrderData.customer);

    const { isValid, message } = validateOrderInfo(salesOrderData, customer);
    if (!isValid) {
      return { success: false, message: message };
    }

    const leadSource = await this.frappeClient.getDoc("Lead Source", customer.first_source);

    const policyNames = salesOrderData.policies.map(policy => policy.policy);
    const policyData = await this.frappeClient.getList("Policy", {
      filters: [["name", "in", policyNames]]
    });

    const productCategoryNames = salesOrderData.product_categories.map(productCategory => productCategory.product_category);
    const productCategoryData = await this.frappeClient.getList("Product Category", {
      filters: [["name", "in", productCategoryNames]]
    });

    const promotionNames = extractPromotions(salesOrderData);
    const promotionData = await this.frappeClient.getList("Promotion", {
      filters: [["name", "in", promotionNames]]
    });

    const primarySalesPersonName = salesOrderData.primary_sales_person;
    const primarySalesPerson = await this.frappeClient.getDoc("Sales Person", primarySalesPersonName);

    const secondarySalesPersonNames = salesOrderData.sales_team
      .filter(salesPerson => salesPerson.sales_person !== salesOrderData.primary_sales_person)
      .map(salesPerson => salesPerson.sales_person);

    const secondarySalesPeople = await this.frappeClient.getList("Sales Person", {
      filters: [["name", "in", secondarySalesPersonNames]]
    });

    const content = composeSalesOrderNotification(salesOrderData, promotionData, leadSource, policyData, productCategoryData, customer, primarySalesPerson, secondarySalesPeople);

    const _response = await larkClient.im.message.create({
      params: {
        receive_id_type: "chat_id"
      },
      data: {
        receive_id: CHAT_GROUPS.SUPPORT_ERP_SALES.chat_id,
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

      if (!orderChain.length) { continue; }

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
        console.error(error);
      }
    }
  }

  static async remindReorderOnHandTempProduct(env) {
    const service = new SalesOrderService(env);
    const db = service.db;

    const larkClient = LarksuiteService.createClient(env);
    try {
      const tenMinutesAgoDate = new Date();
      tenMinutesAgoDate.setMinutes(tenMinutesAgoDate.getMinutes() - 10);
      const tenMinutesAgoTimestamp = tenMinutesAgoDate.toISOString();

      // JEWELRY (Serial-based)
      const jewelryIdsToUpdate = await service.processJewelryNotifications(db, tenMinutesAgoTimestamp, larkClient, CHAT_GROUPS.SUPPORT_ERP_SALES.chat_id);

      // DIAMOND (GIA-based)
      const diamondIdsToUpdate = await service.processDiamondNotifications(db, tenMinutesAgoTimestamp, larkClient, CHAT_GROUPS.SUPPORT_ERP_SALES.chat_id);

      return {
        success: true,
        jewelryNotifiedCount: jewelryIdsToUpdate.length,
        diamondsNotifiedCount: diamondIdsToUpdate.length
      };

    } catch (error) {
      console.error("Error in remindReorderOnHandTempProduct:", error);
      return { success: false, error: error.message };
    }
  }

  async processJewelryNotifications(db, timestamp, larkClient, groupId) {
    const inventoryCheckLines = await db.$queryRaw`
      SELECT ics.rfid_tags, ics.sku, ics.barcode 
      FROM inventory_cms.inventory_check_lines as ics
      WHERE date_created >= ${timestamp}
      ORDER BY ics.date_created DESC;
    `;

    let listFinalEncodedBarcode = [];
    for (const line of inventoryCheckLines) {
      if (line.sku.split("-").length === 1) {
        let rfidTagsList = Array.isArray(line.rfid_tags) ? line.rfid_tags : JSON.parse(line.rfid_tags || "[]");
        if (rfidTagsList.length > 0) listFinalEncodedBarcode.push(...rfidTagsList);
      }
    }

    if (listFinalEncodedBarcode.length === 0) {
      return [];
    }

    const upperCaseBarcodes = listFinalEncodedBarcode.map(item => item.toUpperCase());
    const resultString = upperCaseBarcodes
      .map(item => `'${item.toUpperCase()}'`)
      .join(", ");

    const dataSql = `
      WITH vs_filtered AS (
          SELECT vs.serial_number, vs.order_reference, v.sku, v.barcode, vs.id as variant_serial_id FROM workplace.variant_serials AS vs 
          LEFT JOIN workplace.variants as v ON vs.variant_id = v.id 
          WHERE vs.final_encoded_barcode IN (${resultString})
      ),
      serial_with_order AS (
      SELECT hrv_orders.id AS order_id, hrv_orders.name, vs_f.serial_number, vs_f.sku, vs_f.barcode, vs_f.variant_serial_id FROM vs_filtered AS vs_f
      LEFT JOIN haravan.orders as hrv_orders ON vs_f.order_reference = hrv_orders.name 
      WHERE hrv_orders.cancelled_status = 'uncancelled' 
      ),                    
      line_item_temp AS (
          SELECT * FROM haravan.line_items as hl
          LEFT JOIN bizflycrm.line_items as bl on hl.variant_id::TEXT = bl.variant_id
          WHERE title LIKE '%Tạm%' AND serial_number_value IS NOT NULL and serial_number_value != ''
      ),
      vs_with_temp_orders AS (
      SELECT 
          swo.order_id,
          swo.name,
          swo.serial_number,
          swo.barcode,
          swo.sku,
          swo.variant_serial_id 
      FROM 
          line_item_temp AS lit
      JOIN 
          serial_with_order AS swo ON lit.serial_number_value LIKE '%' || swo.serial_number || '%' 
      LEFT JOIN workplace.temporary_products as tp ON swo.variant_serial_id = tp.variant_serial_id 
      WHERE tp.is_notify_lark_reorder = false OR tp.is_notify_lark_reorder IS NULL
      )                
  
      SELECT DISTINCT ON (vs_with_temp_orders.serial_number) 
                      vs_with_temp_orders.serial_number, 
                      vs_with_temp_orders.name, 
                      vs_with_temp_orders.barcode,
                      vs_with_temp_orders.sku,
                      vs_with_temp_orders.variant_serial_id,
                      clm.lark_message_id, 
                      clm.haravan_order_id 
                      FROM vs_with_temp_orders  
                      LEFT JOIN erpnext.sales_order_notification_tracking AS clm 
                      ON vs_with_temp_orders.order_id = clm.order_id;
    `;

    const notifyResult = await db.$queryRaw`${Prisma.raw(dataSql)}`;

    const variantSerialIdsToUpdate = [];

    for (const row of notifyResult) {
      const message = this.composeSendJewelryMessage(row.serial_number, row.barcode.toUpperCase(), row.sku);
      if (row.lark_message_id && !variantSerialIdsToUpdate.includes(row.variant_serial_id)) {
        const success = await larkClient.im.message.reply({
          path: {
            message_id: row.lark_message_id
          },
          data: {
            receive_id: groupId,
            msg_type: "text",
            reply_in_thread: true,
            content: JSON.stringify({
              text: message
            })
          }
        });
        if (success) {
          variantSerialIdsToUpdate.push(row.variant_serial_id);
        }
      }
    }

    if (variantSerialIdsToUpdate.length > 0) {
      await db.temporaryProducts.updateMany({
        where: {
          variant_serial_id: {
            in: variantSerialIdsToUpdate
          }
        },
        data: {
          is_notify_lark_reorder: true
        }
      });
    }
    return variantSerialIdsToUpdate;
  }

  async processDiamondNotifications(db, timestamp, larkClient, groupId) {
    const giaResult = await db.$queryRaw`
      SELECT li.sku FROM haravan.variants AS li 
      LEFT JOIN haravan.warehouse_inventories AS hw ON li.id = hw.variant_id 
      WHERE li.sku LIKE '%-GIA%' AND li.database_updated_at >= ${timestamp}
      GROUP BY li.sku 
      HAVING SUM(hw.qty_onhand) > 0;
    `;

    let giaList = giaResult.map(line => line.sku.split("-")[1]).filter(part => part && part.startsWith("GIA"));
    giaList = this.preprocessGiaList(giaList);

    if (giaList.length === 0) {
      console.warn("No new diamond GIA numbers found to process.");
      return [];
    }

    const conditions = giaList
      .map(gia => `gia_report_no LIKE '%${gia}%'`)
      .join(" OR ");

    const dataSql = `
      WITH selected_products AS (
          SELECT haravan_variant_id, gia_report_no
          FROM workplace.temporary_products
          WHERE (${conditions}) 
          AND (is_notify_lark_reorder IS NULL OR is_notify_lark_reorder = false) 
      ),
      joined_orders AS (
          SELECT 
              lpv.order_id, 
              sp.haravan_variant_id, 
              sp.gia_report_no
          FROM selected_products sp
          LEFT JOIN haravan.line_items lpv 
              ON sp.haravan_variant_id = lpv.variant_id
          LEFT JOIN haravan.orders ord
              ON lpv.order_id = ord.id
          WHERE ord.cancelled_status = 'uncancelled'
      )
  
      SELECT crm.*, jo.gia_report_no as gia_report_no, jo.haravan_variant_id as haravan_variant_id 
      FROM joined_orders jo
      LEFT JOIN erpnext.sales_order_notification_tracking crm ON jo.order_id = crm.order_id;
    `;

    const giaNotifyResult = await db.$queryRaw`${Prisma.raw(dataSql)}`;

    const haravanVariantIdsToUpdate = [];
    for (const row of giaNotifyResult) {
      const message = this.composeSendDiamondMessage(row.gia_report_no);
      if (row.lark_message_id && !haravanVariantIdsToUpdate.includes(row.haravan_variant_id)) {
        const success = await larkClient.im.message.reply({
          path: {
            message_id: row.lark_message_id
          },
          data: {
            receive_id: groupId,
            msg_type: "text",
            reply_in_thread: true,
            content: JSON.stringify({
              text: message
            })
          }
        });
        if (success) {
          haravanVariantIdsToUpdate.push(row.haravan_variant_id);
        }
      }
    }

    if (haravanVariantIdsToUpdate.length > 0) {
      await db.temporaryProducts.updateMany({
        where: {
          haravan_variant_id: {
            in: haravanVariantIdsToUpdate
          }
        },
        data: {
          is_notify_lark_reorder: true
        }
      });
    }
    return haravanVariantIdsToUpdate;
  }

  composeSendJewelryMessage(serialNumber, barcode, sku) {
    return stringSquish(`
      <b>HÀNG VỀ</b>
      Số serial: ${serialNumber}
      Barcode: ${barcode} 
      SKU: ${sku}
      Vui lòng đặt lại đơn hàng
    `);
  }

  composeSendDiamondMessage(giaReportNo) {
    return stringSquish(`
      <b>HÀNG VỀ</b>
      Kim cương có mã GIA${giaReportNo}
      Vui lòng đặt lại đơn hàng
    `);
  }

  preprocessGiaList (giaList) {
    return giaList.map(gia => {
      return gia.startsWith("GIA") ? gia.slice(3) : gia;
    });
  };
}
