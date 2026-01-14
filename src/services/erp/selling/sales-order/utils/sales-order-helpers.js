import * as Sentry from "@sentry/cloudflare";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { Prisma } from "@prisma-cli";
import { randomUUID } from "crypto";
import { escapeSqlValue } from "src/services/utils/sql-helpers";
import { mapSalesOrdersToDatabase } from "src/services/erp/selling/sales-order/utils/sales-order-mappers";
import { fetchChildRecordsFromERP } from "src/services/utils/sql-helpers";

dayjs.extend(utc);

const CHUNK_SIZE = 30;

export async function fetchSalesOrdersFromERP(frappeClient, doctype, fromDate, toDate, pageSize) {
  try {
    const filters = { modified: [">=", fromDate] };
    if (toDate) filters.modified = ["between", [fromDate, toDate]];

    const allSalesOrders = [];
    let start = 0;
    // get list of sales orders
    while (true) {
      const batch = await frappeClient.getList(doctype, {
        filters: filters,
        limit_start: start,
        limit_page_length: pageSize,
        order_by: "creation desc"
      });

      if (!Array.isArray(batch) || batch.length === 0) break;

      // fetch data from child tables of sales order
      const orderNames = batch.map(item => item.name);
      const salesOrderItems = await fetchChildRecordsFromERP(frappeClient, orderNames, "tabSales Order Item");
      const salesTeams = await fetchChildRecordsFromERP(frappeClient, orderNames, "tabSales Team");
      const salesOrderPolicies = await fetchChildRecordsFromERP(frappeClient, orderNames, "tabSales Order Policy");
      const salesOrderPromotions = await fetchChildRecordsFromERP(frappeClient, orderNames, "tabSales Order Promotion");
      const salesOrderPurposes = await fetchChildRecordsFromERP(frappeClient, orderNames, "tabSales Order Purpose");
      const salesOrderProductCategories = await fetchChildRecordsFromERP(frappeClient, orderNames, "tabSales Order Product Category");
      const debtHistory = await fetchChildRecordsFromERP(frappeClient, orderNames, "tabOrder and Debt Tracking");
      const paymentEntries = await fetchChildRecordsFromERP(frappeClient, orderNames, "tabPayment Entry Reference", { parentfield: "payment_entries" });

      // group records by sales order name
      const groupByParent = arr => arr.reduce((acc, item) => {
        (acc[item.parent] = acc[item.parent] || []).push(item);
        return acc;
      }, {});
      const salesOrderItemsMap = groupByParent(salesOrderItems);
      const salesTeamMap = groupByParent(salesTeams);
      const salesOrderPoliciesMap = groupByParent(salesOrderPolicies);
      const salesOrderPromotionsMap = groupByParent(salesOrderPromotions);
      const salesOrderPurposesMap = groupByParent(salesOrderPurposes);
      const salesOrderProductCategoriesMap = groupByParent(salesOrderProductCategories);
      const debtHistoryMap = groupByParent(debtHistory);
      const paymentEntriesMap = groupByParent(paymentEntries);

      // add sales order items and sales team to each sales order
      batch.forEach(item => {
        item.items = salesOrderItemsMap[item.name] || [];
        item.sales_team = salesTeamMap[item.name] || [];
        item.policies = salesOrderPoliciesMap[item.name] || [];
        item.promotions = salesOrderPromotionsMap[item.name] || [];
        item.sales_order_purposes = salesOrderPurposesMap[item.name] || [];
        item.product_categories = salesOrderProductCategoriesMap[item.name] || [];
        item.debt_histories = debtHistoryMap[item.name] || [];
        item.payment_entries = paymentEntriesMap[item.name] || [];
      });

      allSalesOrders.push(...batch);
      start += pageSize;
      if (batch.length < pageSize) break;
    }
    return allSalesOrders;
  } catch (error) {
    throw error;
  }
}

export async function saveSalesOrdersToDatabase(db, salesOrders) {
  try {
    const mappedData = mapSalesOrdersToDatabase(salesOrders);
    if (mappedData.length === 0) {
      return;
    }

    // Process in chunks to avoid SQL statement size limits
    for (let i = 0; i < mappedData.length; i += CHUNK_SIZE) {
      const chunk = mappedData.slice(i, i + CHUNK_SIZE);

      // Get fields including both database timestamp columns for INSERT
      const fields = ["uuid", ...Object.keys(chunk[0]).filter(field =>
        field !== "database_created_at" && field !== "database_updated_at"
      ), "database_created_at", "database_updated_at"];
      const fieldsSql = fields.map(field => `"${field}"`).join(", ");

      // Create VALUES clause with generated UUIDs and timestamps
      const currentTimestamp = new Date();
      const values = chunk.map(salesOrder => {
        const salesOrderWithTimestamps = {
          uuid: randomUUID(),
          ...salesOrder,
          database_created_at: currentTimestamp,
          database_updated_at: currentTimestamp
        };
        const fieldValues = fields.map(field => escapeSqlValue(salesOrderWithTimestamps[field]));
        return `(${fieldValues.join(", ")})`;
      }).join(",\n  ");

      // Create UPDATE SET clause for ON CONFLICT (exclude "name", "uuid", and "database_created_at")
      const updateSetSql = fields
        .filter(field => field !== "name" && field !== "uuid" && field !== "database_created_at")
        .map(field => {
          if (field === "database_updated_at") {
            return `"${field}" = CURRENT_TIMESTAMP`;
          }
          return `"${field}" = EXCLUDED."${field}"`;
        })
        .join(", ");

      const query = `
        INSERT INTO "erpnext"."sales_orders" (${fieldsSql})
        VALUES ${values}
        ON CONFLICT (name) DO UPDATE SET
        ${updateSetSql};
      `;
      await db.$queryRaw`${Prisma.raw(query)}`;
    }

  } catch (error) {
    Sentry.captureException(error);
  }
}

const PAYMENT_GATEWAY_ERP = "Thanh toán qua ERP";

export function calculateOrderPaymentRecordsTotal(orderDoc) {
  if (!orderDoc) return 0;

  const paymentRecords = (orderDoc.payment_records || []).filter(r =>
    typeof r.kind === "string" &&
    ["capture", "authorization"].includes(r.kind.toLowerCase()) &&
    r.gateway !== PAYMENT_GATEWAY_ERP
  );
  const paymentRecordsTotal = paymentRecords.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  return paymentRecordsTotal;
}

export function calculateGroupOrderPaymentRecordsTotal(orderDocs) {
  if (!orderDocs || orderDocs.length === 0) return 0;

  return orderDocs.reduce((total, order) => {
    return total + calculateOrderPaymentRecordsTotal(order);
  }, 0);
}

export async function ensureSelfReference(frappeClient, order, doctype = "Sales Order") {
  // Update self-reference if missing (e.g. new order)
  if (order && order.name) {
    const hasSelfRef = order.ref_sales_orders?.some(r => r.sales_order === order.name);
    if (!hasSelfRef) {
      const updatedRefs = [
        ...(order.ref_sales_orders || []),
        { doctype: "Sales Order Reference", sales_order: order.name }
      ];

      await frappeClient.update({
        doctype: doctype,
        name: order.name,
        ref_sales_orders: updatedRefs
      });

      order.ref_sales_orders = updatedRefs;
    }
  }
  return order;
}
