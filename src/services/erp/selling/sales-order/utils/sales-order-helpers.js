import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { mapSalesOrderToDatabase, mapSalesOrderItemToDatabase, mapSalesTeamToDatabase } from "src/services/erp/selling/sales-order/utils/sales-order-mappers";

dayjs.extend(utc);

export async function fetchSalesOrdersFromERP(frappeClient, doctype, fromDate, toDate, pageSize) {
  try {
    const filters = { modified: [">=", fromDate] };
    if (toDate) filters.modified = ["between", [fromDate, toDate]];

    const allSalesOrders = [];
    let start = 0;
    // get list of sales orders
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
    throw error;
  }
}

export async function fetchSalesOrderItemsFromERP(frappeClient, salesOrderNames) {
  if (!Array.isArray(salesOrderNames) || salesOrderNames.length === 0) {
    return [];
  }
  const quotedNames = salesOrderNames.map(name => `"${name}"`).join(", ");
  const sql = `SELECT * FROM \`tabSales Order Item\` WHERE parent IN (${quotedNames})`;
  const salesOrderItems = await frappeClient.executeSQL(sql);
  return salesOrderItems || [];
}

export async function fetchSalesTeamFromERP(frappeClient, salesOrderNames) {
  if (!Array.isArray(salesOrderNames) || salesOrderNames.length === 0) {
    return [];
  }
  const quotedNames = salesOrderNames.map(name => `"${name}"`).join(", ");
  const sql = `SELECT * FROM \`tabSales Team\` WHERE parent IN (${quotedNames})`;
  const salesTeams = await frappeClient.executeSQL(sql);
  return salesTeams || [];
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
  const mappedSalesOrderItems = salesOrderItems.map(mapSalesOrderItemToDatabase);
  for (const salesOrderItem of mappedSalesOrderItems) {
    await db.erpnextSalesOrderItem.upsert({
      where: { name: salesOrderItem.name },
      update: salesOrderItem,
      create: salesOrderItem
    });
  }
}

export async function saveSalesTeamToDatabase(db, salesTeam) {
  const mappedSalesTeam = salesTeam.map(mapSalesTeamToDatabase);
  for (const salesTeam of mappedSalesTeam) {
    await db.erpnextSalesTeam.upsert({
      where: { name: salesTeam.name },
      update: salesTeam,
      create: salesTeam
    });
  }
}

