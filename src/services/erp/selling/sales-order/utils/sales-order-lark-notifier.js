
import LarksuiteService from "services/larksuite/lark";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import { getRefOrderChain } from "services/ecommerce/order-tracking/queries/get-initial-order";
import Larksuite from "services/larksuite";
import { ERPR2StorageService } from "services/r2-object/erp/erp-r2-storage-service";
import { retryQuery } from "src/services/utils/retry-utils";
import {
  composeOrderUpdateMessage,
  composeSalesOrderNotification,
  findMainOrder,
  isMissingJewelrySerial,
  extractPromotions
} from "services/erp/selling/sales-order/utils/sales-order-notification";
import { validateSalesOrder } from "services/erp/selling/sales-order/utils/sales-order-validator";
import {
  fetchAndNormalizeAttachments,
  calculateGroupPayments,
  getAllRelatedSalesOrders,
  extractR2KeyFromUrl
} from "src/services/erp/selling/sales-order/utils/sales-order-helpers";

async function _getLarkUserIdByEmail(db, email) {
  if (!email) return null;
  const user = await db.larksuite_users.findFirst({
    where: {
      OR: [
        { email: email },
        { enterprise_email: email }
      ]
    },
    select: { user_id: true }
  });
  return user?.user_id || null;
}

async function _sendAttachmentsToLark(larkClient, env, attachments, messageId, chatId) {
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
              text: file.file_url
            })
          }
        });
        return replyResponse.msg === "success";
      } else {
        const r2Key = extractR2KeyFromUrl(file.file_url);
        if (!r2Key) return false;
        const imageBuffer = await new ERPR2StorageService(env).getObjectByKey(r2Key);
        if (!imageBuffer) return false;
        return Larksuite.Messaging.ImageMessagingService.sendLarkImageFromUrl({
          imageBuffer,
          chatId: chatId,
          env: env,
          rootMessageId: messageId
        });
      }
    })
  );
}

async function composeNewOrderContent(frappeClient, db, salesOrderData, orderCustomer, promotionData, isReorder = false) {
  const customer = orderCustomer ?? (await frappeClient.getDoc("Customer", salesOrderData.customer));

  const leadSource = await frappeClient.getDoc("Lead Source", customer.first_source);

  const policyNames = salesOrderData.policies.map(policy => policy.policy);
  const policyData = await frappeClient.getList("Policy", {
    filters: [["name", "in", policyNames]]
  });

  const productCategoryNames = salesOrderData.product_categories.map(productCategory => productCategory.product_category);
  const productCategoryData = await frappeClient.getList("Product Category", {
    filters: [["name", "in", productCategoryNames]]
  });

  const purposeNames = (salesOrderData.sales_order_purposes || []).map(purpose => purpose.purchase_purpose || purpose.sales_order_purpose || purpose.purpose);
  const purposeData = await frappeClient.getList("Purchase Purpose", {
    filters: [["name", "in", purposeNames]]
  });

  const primarySalesPersonName = salesOrderData.primary_sales_person;
  const primarySalesPerson = await frappeClient.getDoc("Sales Person", primarySalesPersonName);

  const secondarySalesPersonNames = salesOrderData.sales_team
    .filter(salesPerson => salesPerson.sales_person !== salesOrderData.primary_sales_person)
    .map(salesPerson => salesPerson.sales_person);

  const secondarySalesPeople = await frappeClient.getList("Sales Person", {
    filters: [["name", "in", secondarySalesPersonNames]]
  });

  let content = composeSalesOrderNotification(salesOrderData, promotionData, leadSource, policyData, productCategoryData, purposeData, customer, primarySalesPerson, secondarySalesPeople);

  if (isReorder) {
    const hasMissingSerial = salesOrderData.items?.some(item => isMissingJewelrySerial(item));
    if (hasMissingSerial) {
      const primarySalesUserId = await _getLarkUserIdByEmail(db, primarySalesPerson?.employee_email);
      if (primarySalesUserId) {
        content += `\n* <b>Thiếu thông tin:</b>\n- <at user_id="${primarySalesUserId}"></at> Vui lòng bổ sung số serial cho các sản phẩm trang sức còn thiếu!\n\n`;
      }
    }
  }

  return content;
}

export async function sendSalesOrderNotificationToLark(frappeClient, db, env, initialSalesOrderData, isUpdateMessage = false) {
  let salesOrderData = structuredClone(initialSalesOrderData);
  const dbConnection = { timeout: 30000, maxWait: 10000 };
  const larkClient = await LarksuiteService.createClientV2(env);

  salesOrderData.attachments = await fetchAndNormalizeAttachments(
    frappeClient,
    salesOrderData.name,
    env.JEMMIA_ERP_BASE_URL
  );

  const haravanRefOrderId = salesOrderData.haravan_ref_order_id;

  const { allRelatedOrders } = await getAllRelatedSalesOrders(frappeClient, salesOrderData.name, salesOrderData);

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
        const childOrder = await frappeClient.getDoc("Sales Order", splitOrder.name);
        childOrder.attachments = await fetchAndNormalizeAttachments(
          frappeClient,
          childOrder.name,
          env.JEMMIA_ERP_BASE_URL
        );
        childOrders.push(childOrder);
      }
    }
  }

  const { mainOrder, subOrders } = findMainOrder([salesOrderData, ...childOrders]);

  salesOrderData = mainOrder;
  childOrders = subOrders;

  salesOrderData.items = (salesOrderData.items || []).map((item) => ({
    ...item,
    parent_order_number: salesOrderData.order_number,
    parent_grand_total: salesOrderData.grand_total
  }));

  // Compose all sales order into one
  for (const childOrder of childOrders) {
    if (childOrder.items) {
      salesOrderData.items = salesOrderData.items || [];
      salesOrderData.items.push(
        ...childOrder.items.map((item) => ({
          ...item,
          parent_order_number: childOrder.order_number,
          parent_grand_total: childOrder.grand_total
        }))
      );
    }
    if (childOrder.attachments) {
      salesOrderData.attachments = salesOrderData.attachments || [];
      salesOrderData.attachments.push(...childOrder.attachments);
    }
    if (childOrder.promotions) {
      salesOrderData.promotions = salesOrderData.promotions || [];
      salesOrderData.promotions.push(...childOrder.promotions);
    }
    if (childOrder.product_categories) {
      salesOrderData.product_categories = salesOrderData.product_categories || [];
      salesOrderData.product_categories.push(...childOrder.product_categories);
    }
    if (childOrder.policies) {
      salesOrderData.policies = salesOrderData.policies || [];
      salesOrderData.policies.push(...childOrder.policies);
    }

    salesOrderData.grand_total += childOrder.grand_total;
    salesOrderData.discount_amount += childOrder.discount_amount;
  }

  const payments = calculateGroupPayments(salesOrderData, childOrders);
  salesOrderData.paid_amount = payments.paid_amount;
  salesOrderData.deposit_amount = payments.deposit_amount;

  const customer = await frappeClient.getDoc("Customer", salesOrderData.customer);

  const { isValid, message } = validateSalesOrder(salesOrderData, customer);
  if (!isValid) {
    return { success: false, message: message };
  }

  const allOrdersToProcess = [salesOrderData, ...childOrders];
  const allPromotionNames = new Set();
  allOrdersToProcess.forEach(order => {
    extractPromotions(order).forEach(p => allPromotionNames.add(p));
  });

  let promotionData = [];
  if (allPromotionNames.size > 0) {
    promotionData = await frappeClient.getList("Promotion", {
      filters: [["name", "in", Array.from(allPromotionNames)]],
      fields: ["*"]
    });
  }

  if (haravanRefOrderId && Number(haravanRefOrderId) > 0) {
    // find the very first order in history
    const refOrders = await getRefOrderChain(db, Number(salesOrderData.haravan_order_id));

    if (!refOrders || refOrders.length === 0) {
      return {
        success: false,
        message: `Không tìm thấy đơn gốc của đơn ${salesOrderData.order_number}`
      };
    }

    const refOrderstNotificationOrderTracking = await db.erpnextSalesOrderNotificationTracking.findMany({
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
      const currentOrderTracking = await db.erpnextSalesOrderNotificationTracking.findFirst({
        where: {
          order_name: salesOrderData.name
        }
      });

      const isOrderTracked = !!currentOrderTracking;

      let content = null;
      let diffAttachments = null;
      if (isOrderTracked) {
        ({ content, diffAttachments } = composeOrderUpdateMessage(
          currentOrderTracking.order_data,
          salesOrderData,
          promotionData
        ));
      } else {
        content = await composeNewOrderContent(frappeClient, db, salesOrderData, customer, promotionData, true);
      }

      if (!content && !diffAttachments) {
        return { success: true, message: "Không có gì thay đổi!" };
      }

      const isSendImagesSuccess = await _sendAttachmentsToLark(
        larkClient,
        env,
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
          await retryQuery(() => db.$transaction(async (tx) => {
            return tx.erpnextSalesOrderNotificationTracking.updateMany({
              where: {
                uuid: currentOrderTracking.uuid
              },
              data: {
                order_data: {
                  items: salesOrderData.items,
                  attachments: salesOrderData.attachments,
                  paid_amount: salesOrderData.paid_amount,
                  deposit_amount: salesOrderData.deposit_amount
                }
              }
            });
          }, dbConnection));
          return { success: true, message: "Cập nhật đơn thành công!" };
        }
        await retryQuery(() => db.erpnextSalesOrderNotificationTracking.create({
          data: {
            lark_message_id: replyResponse.data.message_id,
            order_name: salesOrderData.name,
            haravan_order_id: salesOrderData.haravan_order_id,
            order_data: {
              items: salesOrderData.items,
              attachments: salesOrderData.attachments,
              paid_amount: salesOrderData.paid_amount,
              deposit_amount: salesOrderData.deposit_amount
            }
          }
        }));
        return { success: true, message: "Thông báo đơn đặt lại thành công!" };
      }

      if (isOrderTracked) {
        return { success: false, message: "Cập nhật đơn thất bại!" };
      }
      return { success: false, message: "Thông báo đơn đặt lại thất bại!" };
    }
  }

  const notificationTracking = await db.erpnextSalesOrderNotificationTracking.findFirst({
    where: {
      order_name: salesOrderData.name
    }
  });

  if (notificationTracking) {
    const { content, diffAttachments } = composeOrderUpdateMessage(notificationTracking.order_data || {}, salesOrderData, promotionData);

    if (!content && !diffAttachments) {
      return { success: false, message: "Đơn hàng này đã được gửi thông báo từ trước đó!" };
    }

    const isSendImagesSuccess = await _sendAttachmentsToLark(
      larkClient,
      env,
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
      await retryQuery(() => db.$transaction(async (tx) => {
        return tx.erpnextSalesOrderNotificationTracking.updateMany({
          where: {
            uuid: notificationTracking.uuid
          },
          data: {
            order_data: {
              items: salesOrderData.items,
              attachments: salesOrderData.attachments,
              paid_amount: salesOrderData.paid_amount,
              deposit_amount: salesOrderData.deposit_amount
            }
          }
        });
      }, dbConnection));
      return { success: true, message: "Gửi cập nhật đơn thành công!" };
    }

    return { success: false, message: "Đơn hàng này đã được gửi thông báo từ trước đó!" };
  }

  if (isUpdateMessage) {
    return { success: true, message: "Ok" };
  }

  const content = await composeNewOrderContent(frappeClient, db, salesOrderData, customer, promotionData);

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
    await _sendAttachmentsToLark(
      larkClient,
      env,
      salesOrderData.attachments,
      messageId,
      CHAT_GROUPS.CUSTOMER_INFO.chat_id
    );
  }

  await retryQuery(() => db.erpnextSalesOrderNotificationTracking.create({
    data: {
      lark_message_id: messageId,
      order_name: salesOrderData.name,
      haravan_order_id: salesOrderData.haravan_order_id,
      order_data: {
        items: salesOrderData.items,
        attachments: salesOrderData.attachments,
        paid_amount: salesOrderData.paid_amount,
        deposit_amount: salesOrderData.deposit_amount
      }
    }
  }));

  return { success: true, message: "Đã gửi thông báo thành công!" };
}
