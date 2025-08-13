import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { mapSalesOrderToDatabase, mapSalesOrderItemsToDatabase } from "src/services/erp/selling/sales-order/utils/sales-order-mappers";

dayjs.extend(utc);

export async function fetchSalesOrdersFromERP(frappeClient, doctype, fromDate, toDate, pageSize) {
  try {
    const filters = { modified: [">=", fromDate] };
    if (toDate) filters.modified = ["between", [fromDate, toDate]];

    const allSalesOrders = [];
    let start = 0;
    while (true) {
      const batch = await frappeClient.getList(doctype, {
        filters,
        limit_start: start,
        limit_page_length: pageSize,
        order_by: "creation desc"
      });
      if (!Array.isArray(batch) || batch.length === 0) break;
      allSalesOrders.push(...batch);
      start += pageSize;
      if (batch.length < pageSize) break;
    }
    return allSalesOrders;
  } catch (error) {
    console.error("Error fetching sales orders from ERPNext", { error: error.message });
    throw error;
  }
}
  
export async function fetchSalesOrdersDetails(frappeClient, doctype, salesOrderNames) {
  const salesOrders = await frappeClient.getDoc(doctype, salesOrderNames);
  
  if (salesOrders && typeof salesOrders === "object") {
    return {
      sales_team: salesOrders.sales_team,
      ref_sales_orders: salesOrders.ref_sales_orders,
      promotions: salesOrders.promotions,
      product_categories: salesOrders.product_categories,
      packed_items: salesOrders.packed_items,
      taxes: salesOrders.taxes,
      pricing_rules: salesOrders.pricing_rules,
      payment_records: salesOrders.payment_records,
      payment_schedule: salesOrders.payment_schedule,
      policies: salesOrders.policies,
      items: salesOrders.items
    };
  }
  
  return null;
}

export async function saveSalesOrdersToDatabase(db, salesOrders) {
  const mappedSalesOrders = salesOrders.map(mapSalesOrderToDatabase);
  for (const salesOrder of mappedSalesOrders) {
    await db.erpnextSalesOrders.upsert({
      where: { name: salesOrder.name },
      update: salesOrder,
      create: salesOrder
    });
  }
}

export async function saveSalesOrderItemsToDatabase(db, salesOrderItems) {
  const mappedSalesOrderItems = salesOrderItems.map(mapSalesOrderItemsToDatabase);
  for (const salesOrderItem of mappedSalesOrderItems) {
    await db.erpnextSalesOrderItem.upsert({
      where: { name: salesOrderItem.name },
      update: salesOrderItem,
      create: salesOrderItem
    });
  }
}
