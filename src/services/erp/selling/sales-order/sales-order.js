import * as Sentry from "@sentry/cloudflare";
import FrappeClient from "src/frappe/frappe-client";
import { convertIsoToDatetime } from "src/frappe/utils/datetime";
import LarksuiteService from "services/larksuite/lark";
import Database from "src/services/database";
import AddressService from "src/services/erp/contacts/address/address";
import ContactService from "src/services/erp/contacts/contact/contact";
import CustomerService from "src/services/erp/selling/customer/customer";
import { composeOrderUpdateMessage, composeSalesOrderNotification, extractPromotions, validateOrderInfo } from "services/erp/selling/sales-order/utils/sales-order-notification";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";

import { fetchSalesOrdersFromERP, saveSalesOrdersToDatabase } from "src/services/erp/selling/sales-order/utils/sales-order-helpers";
import { getRefOrderChain } from "services/ecommerce/order-tracking/queries/get-initial-order";
import Larksuite from "services/larksuite";
import { ERPR2StorageService } from "services/r2-object/erp/erp-r2-storage-service";

dayjs.extend(utc);

export default class SalesOrderService {
  static ERPNEXT_PAGE_SIZE = 100;
  static SYNC_TYPE_AUTO = 1; // auto sync when deploy app
  static SYNC_TYPE_MANUAL = 0; // manual sync when call function
  static WEBSITE_DEFAULT_FIRST_SOURCE = "CRM-LEAD-SOURCE-0000023";

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

    const websiteDefaultFirstSource = haravanOrderData.source === "web" ? SalesOrderService.WEBSITE_DEFAULT_FIRST_SOURCE : null;
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
      balance: haravanOrderData.total_price - paidAmount,
      real_order_date: dayjs(haravanOrderData.created_at).utc().format("YYYY-MM-DD"),
      ref_sales_orders: await this.mapRefSalesOrder(haravanOrderData.id)
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
        Sentry.captureException(error);
      }
    }
  }

  static async dequeueSalesOrderNotificationQueue(batch, env) {
    const salesOrderService = new SalesOrderService(env);
    for (const message of batch.messages) {
      try {
        const orderData = message.body;
        await salesOrderService.sendNotificationToLark(orderData, true);
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

  mapRefSalesOrder = async (refOrderId) => {
    try {
      const refOrders = await getRefOrderChain(this.db, Number(refOrderId), true);

      if (!refOrders) {
        return [];
      };

      const erpRefOrders = await this.db.erpnextSalesOrders.findMany({
        where: {
          haravan_order_id: {
            in: refOrders?.map(order => String(order.id))
          }
        }
      });

      return refOrders.map((o) => {
        const refOrder = erpRefOrders.find(order => order.haravan_order_id === String(o.id));

        if (!refOrder) {
          return null;
        }

        return {
          doctype: "Sales Order Reference",
          sales_order: refOrder.name
        };
      }).filter(order => order !== null);
    } catch (e) {
      console.error(e);
      return [];
    }
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

  async sendNotificationToLark(salesOrderData, isUpdateMessage = false) {
    const larkClient = await LarksuiteService.createClientV2(this.env);

    const haravanRefOrderId = salesOrderData.haravan_ref_order_id;

    // Handle case reorder
    if (haravanRefOrderId && Number(haravanRefOrderId) > 0) {
      // find the very first order in history
      const refOrders = await getRefOrderChain(this.db, Number(salesOrderData.haravan_order_id));

      if (!refOrders || refOrders.length === 0) {
        return {
          success: false,
          message: `Không tìm thấy đơn gốc của đơn ${salesOrderData.order_number}`
        };
      }

      const refOrderstNotificationOrderTracking = await this.db.erpnextSalesOrderNotificationTracking.findMany({
        where: {
          haravan_order_id: {
            in: refOrders?.map(order => String(order.id))
          }
        },
        orderBy: {
          database_created_at: "asc"
        }
      });

      if (refOrderstNotificationOrderTracking && refOrderstNotificationOrderTracking.length > 0) {
        const currentOrderTracking = await this.db.erpnextSalesOrderNotificationTracking.findFirst({
          where: {
            order_name: salesOrderData.name
          }
        });

        const isOrderTracked = !!currentOrderTracking;

        let content = null;
        let diffAttachments = null;
        if (isOrderTracked) {
          ({ content, diffAttachments } = await this.composeUpdateOrderContent(
            currentOrderTracking.order_data,
            salesOrderData
          ));
        } else {
          content = await this.composeNewOrderContent(salesOrderData);
        }

        if (!content && !diffAttachments) {
          return { success: true, message: "Không có gì thay đổi!" };
        }

        const isSendImagesSuccess = diffAttachments && diffAttachments.added_file
          ? await Promise.all(
            diffAttachments.added_file.map(async (fileUrl) => {
              const r2Key = SalesOrderService._extractR2KeyFromUrl(fileUrl);
              const imageBuffer = await new ERPR2StorageService(this.env).getObjectByKey(r2Key);

              return Larksuite.Messaging.ImageMessagingService.sendLarkImageFromUrl({
                larkClient,
                imageBuffer,
                chatId: CHAT_GROUPS.CUSTOMER_INFO.chat_id,
                env: this.env,
                rootMessageId: refOrderstNotificationOrderTracking[0].lark_message_id
              });
            })
          )
          : [];

        const replyResponse = content && await larkClient.im.message.reply({
          path: {
            message_id: refOrderstNotificationOrderTracking[0].lark_message_id
          },
          data: {
            receive_id: CHAT_GROUPS.CUSTOMER_INFO.chat_id,
            msg_type: "text",
            reply_in_thread: true,
            content: JSON.stringify({
              text: content
            })
          }
        });

        if ((content && replyResponse.msg === "success") || (isSendImagesSuccess.every(Boolean))) {
          if (isOrderTracked) {
            await this.db.erpnextSalesOrderNotificationTracking.updateMany({
              where: {
                uuid: currentOrderTracking.uuid
              },
              data: {
                order_data: {
                  items: salesOrderData.items,
                  attachments: salesOrderData.attachments
                }
              }
            });
            return { success: true, message: "Cập nhật đơn thành công!" };
          }
          await this.db.erpnextSalesOrderNotificationTracking.create({
            data: {
              lark_message_id: replyResponse.data.message_id,
              order_name: salesOrderData.name,
              haravan_order_id: salesOrderData.haravan_order_id,
              order_data: {
                items: salesOrderData.items,
                attachments: salesOrderData.attachments
              }
            }
          });
          return { success: true, message: "Thông báo đơn đặt lại thành công!" };
        }

        if (isOrderTracked) {
          return { success: false, message: "Cập nhật đơn thất bại!" };
        }
        return { success: false, message: "Thông báo đơn đặt lại thất bại!" };
      }
    }

    const notificationTracking = await this.db.erpnextSalesOrderNotificationTracking.findFirst({
      where: {
        order_name: salesOrderData.name
      }
    });

    if (notificationTracking) {
      const { content, diffAttachments } = await this.composeUpdateOrderContent(notificationTracking.order_data || {}, salesOrderData);

      if (!content && !diffAttachments) {
        return { success: false, message: "Đơn hàng này đã được gửi thông báo từ trước đó!" };
      }

      const isSendImagesSuccess = diffAttachments && diffAttachments.added_file
        ? await Promise.all(
          diffAttachments.added_file.map(async (fileUrl) => {
            const r2Key = SalesOrderService._extractR2KeyFromUrl(fileUrl);
            const imageBuffer = await new ERPR2StorageService(this.env).getObjectByKey(r2Key);
            return Larksuite.Messaging.ImageMessagingService.sendLarkImageFromUrl({
              larkClient,
              imageBuffer,
              chatId: CHAT_GROUPS.CUSTOMER_INFO.chat_id,
              env: this.env,
              rootMessageId: notificationTracking.lark_message_id
            });
          })
        )
        : [];

      // Reply to the root message in the group chat
      const replyResponse = content && await larkClient.im.message.reply({
        path: {
          message_id: notificationTracking.lark_message_id
        },
        data: {
          receive_id: CHAT_GROUPS.CUSTOMER_INFO.chat_id,
          msg_type: "text",
          reply_in_thread: true,
          content: JSON.stringify({
            text: content
          })
        }
      });

      if ((content && replyResponse.msg === "success") || (isSendImagesSuccess.every(Boolean))) {
        // Update
        await this.db.erpnextSalesOrderNotificationTracking.updateMany({
          where: {
            uuid: notificationTracking.uuid
          },
          data: {
            order_data: {
              items: salesOrderData.items,
              attachments: salesOrderData.attachments
            }
          }
        });
        return { success: true, message: "Gửi cập nhật đơn thành công!" };
      }

      return { success: false, message: "Đơn hàng này đã được gửi thông báo từ trước đó!" };
    }

    if (isUpdateMessage) {
      return { success: true, message: "Ok" };
    }

    const customer = await this.frappeClient.getDoc("Customer", salesOrderData.customer);

    const { isValid, message } = validateOrderInfo(salesOrderData, customer);
    if (!isValid) {
      return { success: false, message: message };
    }

    const content = await this.composeNewOrderContent(salesOrderData, customer);

    const _response = await larkClient.im.message.create({
      params: {
        receive_id_type: "chat_id"
      },
      data: {
        receive_id: CHAT_GROUPS.CUSTOMER_INFO.chat_id,
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
        haravan_order_id: salesOrderData.haravan_order_id,
        order_data: {
          items: salesOrderData.items,
          attachments: salesOrderData.attachments
        }
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

  async composeUpdateOrderContent(oldSalesOrderData, salesOrderData) {
    const promotionNames = extractPromotions(salesOrderData);
    const promotionData = await this.frappeClient.getList("Promotion", {
      filters: [["name", "in", promotionNames]]
    });
    return composeOrderUpdateMessage(oldSalesOrderData, salesOrderData, promotionData);
  }

  async composeNewOrderContent(salesOrderData, orderCustomer) {
    const customer = orderCustomer ?? (await this.frappeClient.getDoc("Customer", salesOrderData.customer));

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

    return content;
  }

  static _extractR2KeyFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const r2KeyParam = urlObj.searchParams.get("key");
      if (r2KeyParam) {
        return r2KeyParam;
      }
      if (urlObj.pathname.length > 1) {
        return urlObj.pathname.substring(1);
      }
      return null;
    } catch (e) {
      Sentry.captureException(e);
      return null;
    }
  }
}
