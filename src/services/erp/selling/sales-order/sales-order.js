import * as Sentry from "@sentry/cloudflare";
import FrappeClient from "src/frappe/frappe-client";
import { convertIsoToDatetime } from "src/frappe/utils/datetime";
import LarksuiteService from "services/larksuite/lark";
import Database from "src/services/database";
import AddressService from "src/services/erp/contacts/address/address";
import ContactService from "src/services/erp/contacts/contact/contact";
import CustomerService from "src/services/erp/selling/customer/customer";
import { composeOrderUpdateMessage, composeSalesOrderNotification, extractPromotions, findMainOrder } from "services/erp/selling/sales-order/utils/sales-order-notification";
import { validateSalesOrder } from "services/erp/selling/sales-order/utils/sales-order-validator";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";

import { fetchSalesOrdersFromERP, saveSalesOrdersToDatabase, calculateGroupOrderPaymentRecordsTotal, calculateOrderPaymentRecordsTotal, ensureSelfReference, getAllRelatedPaymentEntries } from "src/services/erp/selling/sales-order/utils/sales-order-helpers";
import { getRefOrderChain } from "services/ecommerce/order-tracking/queries/get-initial-order";
import Larksuite from "services/larksuite";
import { ERPR2StorageService } from "services/r2-object/erp/erp-r2-storage-service";
import HaravanAPI from "services/clients/haravan-client";

dayjs.extend(utc);

export default class SalesOrderService {
  static ERPNEXT_PAGE_SIZE = 100;
  static SYNC_TYPE_AUTO = 1; // auto sync when deploy app
  static SYNC_TYPE_MANUAL = 0; // manual sync when call function
  static WEBSITE_DEFAULT_FIRST_SOURCE = "CRM-LEAD-SOURCE-0000023";
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

    const paymentTransactions = haravanOrderData.transactions.filter(transaction => ["capture", "authorization"].includes(transaction.kind.toLowerCase()));

    const discountCodes = haravanOrderData.discount_codes || [];
    const couponCode = discountCodes.map(item => item.code).join("\n");

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
      fulfillment_completion_date: haravanOrderData.fulfillments.length && haravanOrderData.fulfillments[0].delivered_date ? dayjs(haravanOrderData.fulfillments[0].delivered_date).format("YYYY-MM-DD HH:mm:ss") : null,
      cancelled_status: this.cancelledStatusMapper[haravanOrderData.cancelled_status],
      carrier_status: haravanOrderData.fulfillments.length ? this.carrierStatusMapper[haravanOrderData.fulfillments[0].carrier_status_code] : this.carrierStatusMapper.notdelivered,
      transaction_date: dayjs(haravanOrderData.created_at).add(7, "hour").format("YYYY-MM-DD"),
      haravan_created_at: convertIsoToDatetime(haravanOrderData.created_at, "datetime"),
      total: haravanOrderData.total_line_items_price,
      payment_records: paymentTransactions.map(this.mapPaymentRecordFields),
      contact_person: contact.name,
      customer_address: customerDefaultAdress.name,
      total_amount: haravanOrderData.total_price,
      grand_total: haravanOrderData.total_price,
      real_order_date: await this.getRealOrderDate(haravanOrderData.id) || dayjs(haravanOrderData.created_at).add(7, "hour").format("YYYY-MM-DD"),
      ref_sales_orders: await this.mapRefSalesOrder(haravanOrderData.id)
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
        await salesOrderService.updateSalesOrderPaidAmount(orderData.name);
        await salesOrderService.syncHaravanFinancialStatus(orderData);
      } catch (error) {
        Sentry.captureException(error);
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
    return dayjs(firstOrder.created_at).add(7, "hour").format("YYYY-MM-DD");
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

  async sendNotificationToLark(initialSalesOrderData, isUpdateMessage = false) {
    let salesOrderData = structuredClone(initialSalesOrderData);

    const larkClient = await LarksuiteService.createClientV2(this.env);

    const haravanRefOrderId = salesOrderData.haravan_ref_order_id;

    const { allRelatedOrders } = await this.getAllRelatedSalesOrders(salesOrderData.name, salesOrderData);
    const allOrderNames = allRelatedOrders.map(o => o.name);

    const splitOrderGroupId = salesOrderData.split_order_group;
    const isSplitOrder = salesOrderData.is_split_order;

    let childOrders = [];
    if (splitOrderGroupId && Number(splitOrderGroupId) > 0 && isSplitOrder) {
      const splitOrders = allRelatedOrders.filter(o =>
        o.split_order_group === splitOrderGroupId &&
        o.name !== salesOrderData.name &&
        o.cancelled_status === "Uncancelled"
      );

      if (splitOrders && splitOrders.length > 0) {
        // For each order, find its attachments
        for (const splitOrder of splitOrders) {
          const childOrder = await this.frappeClient.getDoc("Sales Order", splitOrder.name);
          let attachments = await this.frappeClient.getList("File", {
            filters: [
              ["attached_to_doctype", "=", "Sales Order"],
              ["attached_to_name", "=", childOrder.name]
            ],
            fields: ["file_name", "file_url", "is_private"]
          });
          attachments = attachments.map(file => ({
            file_name: file.file_name,
            file_url: `${this.env.JEMMIA_ERP_BASE_URL}${file.file_url}`,
            is_private: file.is_private
          }));
          childOrder.attachments = attachments;
          childOrders.push(childOrder);
        }
      }
    }

    const { mainOrder, subOrders } = findMainOrder([salesOrderData, ...childOrders]);

    salesOrderData = mainOrder;
    childOrders = subOrders;

    salesOrderData.items = salesOrderData.items.map((item) => ({
      ...item,
      parent_order_number: salesOrderData.order_number,
      parent_grand_total: salesOrderData.grand_total
    }));

    // Compose all sales order into one
    for (const childOrder of childOrders) {
      salesOrderData.items.push(
        ...childOrder.items.map((item) => ({
          ...item,
          parent_order_number: childOrder.order_number,
          parent_grand_total: childOrder.grand_total
        }))
      );
      salesOrderData.attachments.push(...childOrder.attachments);
      salesOrderData.promotions.push(...childOrder.promotions);
      salesOrderData.product_categories.push(...childOrder.product_categories);
      salesOrderData.policies.push(...childOrder.policies);

      salesOrderData.grand_total += childOrder.grand_total;
      salesOrderData.discount_amount += childOrder.discount_amount;
    }

    // Calculate Payment Entries Total
    const relatedPaymentEntries = await getAllRelatedPaymentEntries(this.frappeClient, allOrderNames);
    const paymentEntriesTotal = await this.calculateGroupPaymentTotal(allOrderNames, relatedPaymentEntries);
    const paymentRecordsTotal = calculateGroupOrderPaymentRecordsTotal([salesOrderData, ...childOrders]);

    // Set Paid Amount
    salesOrderData.paid_amount = paymentEntriesTotal + paymentRecordsTotal;
    salesOrderData.deposit_amount = paymentEntriesTotal + paymentRecordsTotal;

    const customer = await this.frappeClient.getDoc("Customer", salesOrderData.customer);

    // Fetch promotions for validation
    const promotionNames = extractPromotions(salesOrderData);
    let promotionData = [];
    if (promotionNames.length > 0) {
      promotionData = await this.frappeClient.getList("Promotion", {
        filters: [["name", "in", promotionNames]],
        fields: ["*"]
      });
    }

    const { isValid, message } = validateSalesOrder(salesOrderData, customer, promotionData);
    if (!isValid) {
      return { success: false, message: message };
    }

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
            salesOrderData,
            promotionData
          ));
        } else {
          content = await this.composeNewOrderContent(salesOrderData, customer, promotionData);
        }

        if (!content && !diffAttachments) {
          return { success: true, message: "Không có gì thay đổi!" };
        }

        const isSendImagesSuccess = await this._sendAttachmentsToLark(
          larkClient,
          diffAttachments?.added_file,
          refOrderstNotificationOrderTracking[0].lark_message_id,
          CHAT_GROUPS.CUSTOMER_INFO.chat_id
        );

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
                  attachments: salesOrderData.attachments,
                  paid_amount: salesOrderData.paid_amount
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
                attachments: salesOrderData.attachments,
                paid_amount: salesOrderData.paid_amount
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
      const { content, diffAttachments } = await this.composeUpdateOrderContent(notificationTracking.order_data || {}, salesOrderData, promotionData);

      if (!content && !diffAttachments) {
        return { success: false, message: "Đơn hàng này đã được gửi thông báo từ trước đó!" };
      }

      const isSendImagesSuccess = await this._sendAttachmentsToLark(
        larkClient,
        diffAttachments?.added_file,
        notificationTracking.lark_message_id,
        CHAT_GROUPS.CUSTOMER_INFO.chat_id
      );

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
              attachments: salesOrderData.attachments,
              paid_amount: salesOrderData.paid_amount
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

    const content = await this.composeNewOrderContent(salesOrderData, customer, promotionData);

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

    if (salesOrderData.attachments && salesOrderData.attachments.length > 0) {
      await this._sendAttachmentsToLark(
        larkClient,
        salesOrderData.attachments,
        messageId,
        CHAT_GROUPS.CUSTOMER_INFO.chat_id
      );
    }

    await this.db.erpnextSalesOrderNotificationTracking.create({
      data: {
        lark_message_id: messageId,
        order_name: salesOrderData.name,
        haravan_order_id: salesOrderData.haravan_order_id,
        order_data: {
          items: salesOrderData.items,
          attachments: salesOrderData.attachments,
          paid_amount: salesOrderData.paid_amount
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

  async composeUpdateOrderContent(oldSalesOrderData, salesOrderData, promotionData) {
    return composeOrderUpdateMessage(oldSalesOrderData, salesOrderData, promotionData);
  }

  async composeNewOrderContent(salesOrderData, orderCustomer, promotionData) {
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

  async _sendAttachmentsToLark(larkClient, attachments, messageId, chatId) {
    if (!attachments || attachments.length === 0) {
      return [];
    }

    return await Promise.all(
      attachments.map(async (file) => {
        if (file.is_private) {
          const replyResponse = await larkClient.im.message.reply({
            path: {
              message_id: messageId
            },
            data: {
              receive_id: chatId,
              msg_type: "text",
              reply_in_thread: true,
              content: JSON.stringify({
                text: `Hình ảnh đính kèm (có tính bảo mật): ${file.file_url}`
              })
            }
          });
          return replyResponse.msg === "success";
        } else {
          const r2Key = SalesOrderService._extractR2KeyFromUrl(file.file_url);
          if (!r2Key) return false;
          const imageBuffer = await new ERPR2StorageService(this.env).getObjectByKey(r2Key);
          if (!imageBuffer) return false;
          return Larksuite.Messaging.ImageMessagingService.sendLarkImageFromUrl({
            larkClient,
            imageBuffer,
            chatId: chatId,
            env: this.env,
            rootMessageId: messageId
          });
        }
      })
    );
  }

  static _extractR2KeyFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const r2KeyParam = urlObj.searchParams.get("key");
      if (r2KeyParam) {
        return decodeURIComponent(r2KeyParam);
      }
      if (urlObj.pathname.length > 1) {
        return decodeURIComponent(urlObj.pathname.substring(1));
      }
      return null;
    } catch (e) {
      Sentry.captureException(e);
      return null;
    }
  }

  async updateSalesOrderPaidAmount(salesOrderName) {
    try {
      const currentSalesOrder = await this.frappeClient.getDoc("Sales Order", salesOrderName);
      if (!currentSalesOrder) return null;

      const refSalesOrderNames = [
        currentSalesOrder.name,
        ...(currentSalesOrder.ref_sales_orders || []).map(r => r.sales_order)
      ];
      const paymentEntryNames = await getAllRelatedPaymentEntries(
        this.frappeClient,
        refSalesOrderNames
      );

      // Unique payment entries
      const uniquePaymentEntryNames = [...new Set(paymentEntryNames.map(pe => pe.name))];

      // Fetch payment entries in parallel
      const paymentEntries = await Promise.all(
        uniquePaymentEntryNames.map(name => this.frappeClient.getDoc("Payment Entry", name))
      );

      const currentPaymentEntriesMap = new Map();
      (currentSalesOrder.payment_entries || []).forEach(row => {
        if (row.reference_name) currentPaymentEntriesMap.set(row.reference_name, row.name);
      });

      let paymentEntriesTotal = 0.0;
      const linkedPaymentEntries = [];
      for (const entry of paymentEntries) {
        if (entry && entry.references) {
          const refs = entry.references.filter(r => r.reference_doctype === "Sales Order" && refSalesOrderNames.includes(r.reference_name));

          for (const ref of refs) {
            const allocated = parseFloat(ref.allocated_amount || 0);
            if (entry.payment_type === "Pay") {
              paymentEntriesTotal -= allocated;
            } else {
              paymentEntriesTotal += allocated;
            }
          }

          const ref = refs.find(r => r.reference_name === salesOrderName);

          if (ref) {
            // Build linked payment entry row
            const row = {
              doctype: "Payment Entry Reference",
              reference_doctype: "Payment Entry",
              reference_name: entry.name,
              total_amount: ref.total_amount,
              outstanding_amount: ref.outstanding_amount,
              allocated_amount: entry.payment_type === "Pay" ? -Math.abs(ref.allocated_amount) : ref.allocated_amount,
              mode_of_payment: entry.mode_of_payment,
              gateway: entry.gateway,
              paid_amount: entry.paid_amount,
              payment_date: entry.payment_date,
              payment_order_status: entry.payment_order_status
            };

            if (currentPaymentEntriesMap.has(entry.name)) {
              row.name = currentPaymentEntriesMap.get(entry.name);
            }
            linkedPaymentEntries.push(row);
          }
        }
      }

      const currentLinkedPaymentEntries = currentSalesOrder.payment_entries || [];
      const isPaymentEntriesChanged = currentLinkedPaymentEntries.length !== linkedPaymentEntries.length ||
        !linkedPaymentEntries.every(l => currentLinkedPaymentEntries.some(c => c.reference_name === l.reference_name));
      // Calculate group grand total
      const { allRelatedOrders, allSplitOrders } = await this.getAllRelatedSalesOrders(salesOrderName, currentSalesOrder);
      const relatedOrderNames = allRelatedOrders.map(o => o.name);

      const splitOrders = allSplitOrders.filter(o => o.cancelled_status === "Uncancelled");

      const splitOrderDocs = splitOrders.map(order => allRelatedOrders.find(r => r.name === order.name) || order);

      const groupGrandTotal = splitOrderDocs.reduce((sum, order) => sum + parseFloat(order.grand_total || 0), 0);
      const groupPaymentRecordsTotal = calculateGroupOrderPaymentRecordsTotal(splitOrderDocs);

      // Combined Payment Total = (ERP Payment Entries linked to any order in group) + (Haravan Payment Records on each split order)
      const relatedPaymentEntries = await getAllRelatedPaymentEntries(this.frappeClient, relatedOrderNames);
      const groupPaymentEntryTotal = await this.calculateGroupPaymentTotal(relatedOrderNames, relatedPaymentEntries);
      const groupPaymentTotal = groupPaymentEntryTotal + groupPaymentRecordsTotal;

      if (groupPaymentTotal >= groupGrandTotal) {
        const targetOrders = (splitOrders && splitOrders.length > 0) ? splitOrderDocs : [{ name: salesOrderName, grand_total: currentSalesOrder.grand_total }];
        let updatedCurrentDoc = currentSalesOrder;

        for (const order of targetOrders) {
          const doc = (order.name === salesOrderName) ? currentSalesOrder : order;
          const docPaid = parseFloat(doc.paid_amount || 0);
          const docTotal = parseFloat(doc.grand_total || 0);
          const currentTotalAllocated = parseFloat(doc.total_allocated_group_payment || 0);
          const currentBalanceGroup = parseFloat(doc.balance_group_payment || 0);
          const newBalanceGroup = groupGrandTotal - groupPaymentTotal;
          const hasChangeAmount = docPaid !== docTotal || currentTotalAllocated !== groupPaymentTotal || currentBalanceGroup !== newBalanceGroup;

          if (order.name === salesOrderName) {
            if (hasChangeAmount || isPaymentEntriesChanged) {
              const updated = await this.frappeClient.update({
                doctype: "Sales Order",
                name: doc.name,
                paid_amount: docTotal,
                balance: 0,
                payment_entries: linkedPaymentEntries,
                total_allocated_group_payment: groupPaymentTotal,
                balance_group_payment: newBalanceGroup
              });
              updatedCurrentDoc = updated;
            }
          }
          else if (hasChangeAmount) {
            await this.frappeClient.update({
              doctype: "Sales Order",
              name: doc.name,
              paid_amount: docTotal,
              balance: 0,
              total_allocated_group_payment: groupPaymentTotal,
              balance_group_payment: newBalanceGroup
            });
          }
        }
        return updatedCurrentDoc;
      }

      // Standard Single Order Logic
      const salesOrderGrandTotal = currentSalesOrder.grand_total;
      const currentPaidAmount = currentSalesOrder.paid_amount;
      const currentBalance = currentSalesOrder.balance;

      let totalPaid = 0.0;

      // Calculate total from Sales Order Payment Records
      const paymentRecordsTotal = calculateOrderPaymentRecordsTotal(currentSalesOrder);
      if (parseFloat(paymentRecordsTotal) >= parseFloat(salesOrderGrandTotal)) {
        totalPaid = parseFloat(paymentRecordsTotal);
      } else {
        totalPaid = parseFloat(paymentEntriesTotal) + parseFloat(paymentRecordsTotal);
      }

      if (totalPaid >= parseFloat(salesOrderGrandTotal)) {
        totalPaid = parseFloat(salesOrderGrandTotal);
      }

      const balance = parseFloat(salesOrderGrandTotal) - parseFloat(totalPaid);

      // Update if changed
      const currentTotalAllocatedGroupPayment = parseFloat(currentSalesOrder.total_allocated_group_payment || 0);
      const currentBalanceGroupPayment = parseFloat(currentSalesOrder.balance_group_payment || 0);
      const newBalanceGroupPayment = parseFloat(groupGrandTotal - groupPaymentTotal);

      if (parseFloat(totalPaid) !== parseFloat(currentPaidAmount) ||
          parseFloat(currentBalance) !== parseFloat(balance) ||
          isPaymentEntriesChanged ||
          currentTotalAllocatedGroupPayment !== parseFloat(groupPaymentTotal) ||
          currentBalanceGroupPayment !== newBalanceGroupPayment
      ) {
        const updatedDoc = await this.frappeClient.update({
          doctype: "Sales Order",
          name: salesOrderName,
          paid_amount: totalPaid,
          balance: balance,
          payment_entries: linkedPaymentEntries,
          total_allocated_group_payment: groupPaymentTotal,
          balance_group_payment: newBalanceGroupPayment
        });
        console.warn(`Updated Sales Order ${salesOrderName}: Paid ${totalPaid}, Balance ${balance}`);
        return updatedDoc;
      }

      return currentSalesOrder;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  async backfillPaidAmount() {
    let skip = 0;
    const take = 50;
    while (true) {
      const orders = await this.db.erpnextSalesOrders.findMany({
        select: { name: true },
        skip: skip,
        take: take,
        orderBy: { creation: "desc" }
      });

      if (orders.length === 0) break;

      for (const order of orders) {
        if (order.name) {
          console.warn(`Processing backfill for order: ${order.name}`);
          try {
            await this.updateSalesOrderPaidAmount(order.name);
          } catch (err) {
            Sentry.captureException(err);
          }
          // Add timeout between orders
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      skip += take;
    }
  }

  async syncHaravanFinancialStatus(salesOrderData) {
    if (Math.abs(salesOrderData.grand_total - salesOrderData.paid_amount) <= 1000) {
      const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
      if (!HRV_API_KEY) {
        return;
      }
      const haravanClient = new HaravanAPI(HRV_API_KEY);
      try {
        const response = await haravanClient.order.getOrder(salesOrderData.haravan_order_id);
        const haravanOrder = response.order;

        if (haravanOrder.financial_status === "paid") {
          return;
        }

        const transactions = haravanOrder.transactions || [];

        const paidAmount = transactions
          .filter(t => ["capture", "authorization"].includes(t.kind?.toLowerCase()))
          .reduce((total, t) => total + parseFloat(t.amount || 0), 0);

        const remainingAmount = salesOrderData.grand_total - paidAmount;

        if (remainingAmount > 0) {
          await haravanClient.orderTransaction.createTransaction(salesOrderData.haravan_order_id, {
            amount: remainingAmount,
            kind: "capture",
            gateway: SalesOrderService.PAYMENT_GATEWAY_ERP
          });
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  async getAllRelatedSalesOrders(initialOrderName, initialOrderDoc = null) {
    const relatedOrdersMap = new Map();
    const initialOrder = initialOrderDoc || await this.frappeClient.getDoc("Sales Order", initialOrderName);

    if (!initialOrder) return {
      allRelatedOrders: [],
      allSplitOrders: []
    };

    relatedOrdersMap.set(initialOrderName, {
      name: initialOrder.name,
      cancelled_status: initialOrder.cancelled_status,
      split_order_group: initialOrder.split_order_group
    });

    let allSplitOrders = [];

    if (initialOrder.is_split_order && initialOrder.split_order_group) {
      const groupOrders = await this.frappeClient.getList("Sales Order", {
        filters: [
          ["split_order_group", "=", initialOrder.split_order_group],
          ["is_split_order", "=", 1]
        ],
        fields: ["name", "cancelled_status", "split_order_group", "grand_total", "paid_amount", "total_allocated_group_payment", "balance_group_payment"]
      });

      allSplitOrders = groupOrders;

      groupOrders.forEach(o => relatedOrdersMap.set(o.name, {
        name: o.name,
        cancelled_status: o.cancelled_status,
        split_order_group: o.split_order_group
      }));
    } else {
      allSplitOrders = [{
        name: initialOrder.name,
        cancelled_status: initialOrder.cancelled_status,
        split_order_group: initialOrder.split_order_group
      }];
    }

    const toVisit = Array.from(relatedOrdersMap.keys());
    const visited = new Set(relatedOrdersMap.keys());

    while (toVisit.length > 0) {
      const currentSoName = toVisit.pop();
      let currentOrderDoc = null;
      if (currentSoName === initialOrderName) {
        currentOrderDoc = initialOrder;
      } else {
        try {
          currentOrderDoc = await this.frappeClient.getDoc("Sales Order", currentSoName);
        } catch (e) {
          console.warn(`Could not fetch Sales Order ${currentSoName} for traversal`, e);
          continue;
        }
      }

      if (currentOrderDoc) {
        relatedOrdersMap.set(currentSoName, currentOrderDoc);
      }

      if (currentOrderDoc && currentOrderDoc.ref_sales_orders) {
        for (const ref of currentOrderDoc.ref_sales_orders) {
          if (ref.sales_order && !visited.has(ref.sales_order)) {
            visited.add(ref.sales_order);
            toVisit.push(ref.sales_order);
          }
        }
      }

      const refsUp = await this.frappeClient.getList("Sales Order", {
        filters: [["Sales Order Reference", "sales_order", "=", currentSoName]],
        fields: ["name"]
      });

      for (const parentOrder of refsUp) {
        if (parentOrder.name && !visited.has(parentOrder.name)) {
          visited.add(parentOrder.name);
          toVisit.push(parentOrder.name);
        }
      }
    }

    return {
      allRelatedOrders: Array.from(relatedOrdersMap.values()),
      allSplitOrders: allSplitOrders
    };
  }

  async calculateGroupPaymentTotal(relatedOrderNames, paymentEntries) {
    if (!paymentEntries || paymentEntries.length === 0) return 0;

    let totalAllocated = 0;
    const processedPeIds = new Set();

    for (const peStub of paymentEntries) {
      if (processedPeIds.has(peStub.name)) continue;
      processedPeIds.add(peStub.name);

      try {
        const fullPe = await this.frappeClient.getDoc("Payment Entry", peStub.name);
        if (fullPe && fullPe.references) {
          const relevantRefs = fullPe.references.filter(r =>
            r.reference_doctype === "Sales Order" &&
            relatedOrderNames.includes(r.reference_name)
          );

          for (const ref of relevantRefs) {
            const amount = parseFloat(ref.allocated_amount || 0);
            if (fullPe.payment_type === "Pay") {
              totalAllocated -= amount;
            } else {
              totalAllocated += amount;
            }
          }
        }
      } catch (e) {
        console.warn(`Could not fetch Payment Entry ${peStub.name}`, e);
      }
    }

    return totalAllocated;
  }
}
