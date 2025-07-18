import FrappeClient from "../../../../frappe/frappe-client";
import { convertIsoToDatetime } from "../../../../frappe/utils/datetime";

import AddressService from "../../contacts/address/address";
import ContactService from "../../contacts/contact/contact";
import CustomerService from "../customer/customer";
import Database from "../../../database";

import {
  mapSalesOrderToDatabase,
  mapSalesOrderItemToDatabase
} from "./utils/sales-order-mappers";

import {
  formatTimeRange,
  calculateDateRange,
  createSyncResponse,
  logSyncProgress,
  batchItems,
  retryWithBackoff
} from "./utils/sales-order-helpers";

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

  async fetchSalesOrdersFromERP(fromDate, toDate = null) {
    try {
      const filters = {};
      filters["modified"] = [">=", fromDate];
      
      if (toDate) {
        filters["modified"] = ["between", [fromDate, toDate]];
      }

      let allSalesOrders = [];
      let start = 0;
      const pageSize = 1000; // Fetch 1000 records per batch
      let hasMoreData = true;

      while (hasMoreData) {
        logSyncProgress("info", `Fetching Sales Orders batch ${Math.floor(start/pageSize) + 1} (from ${start})`);
        
        const salesOrdersBatch = await retryWithBackoff(async () => {
          return await this.frappeClient.getList(this.doctype, {
            filters: filters,
            limit_start: start,
            limit_page_length: pageSize,
            order_by: "creation desc"
          });
        });

        if (salesOrdersBatch && salesOrdersBatch.length > 0) {
          allSalesOrders.push(...salesOrdersBatch);
          start += pageSize;
          
          // If we got less than pageSize, we've reached the end
          if (salesOrdersBatch.length < pageSize) {
            hasMoreData = false;
          }
        } else {
          hasMoreData = false;
        }
      }

      logSyncProgress("success", `Total fetched ${allSalesOrders.length} Sales Orders`);
      return allSalesOrders;
      
    } catch (error) {
      logSyncProgress("error", "Error fetching Sales Orders from ERPNext", { error: error.message });
      throw error;
    }
  }

  /**
   * Fetches Sales Order details from ERPNext
   * @param {string} salesOrderName - Sales order name
   * @returns {Object|null} Sales order details
   */
  async fetchSalesOrderDetails(salesOrderName) {
    try {
      const salesOrder = await retryWithBackoff(async () => {
        return await this.frappeClient.getDoc(this.doctype, salesOrderName);
      });
      return salesOrder;
    } catch (error) {
      logSyncProgress("error", `Error fetching Sales Order details for ${salesOrderName}`, { error: error.message });
      return null;
    }
  }

  /**
   * Saves sales order to database
   * @param {Object} salesOrder - Sales order data
   * @returns {Object} Upsert result
   */
  async saveSalesOrderToDatabase(salesOrder) {
    try {
      const salesOrderData = mapSalesOrderToDatabase(salesOrder);

      const result = await this.db.ErpnextSalesOrder.upsert({
        where: {
          name: salesOrderData.name
        },
        update: salesOrderData,
        create: salesOrderData
      });

      logSyncProgress("success", `Successfully saved Sales Order: ${salesOrder.name}`);
      return result;
      
    } catch (error) {
      logSyncProgress("error", `Error saving Sales Order ${salesOrder.name} to database`, { error: error.message });
      throw error;
    }
  }

  /**
   * Saves sales order items to database
   * @param {string} salesOrderName - Parent sales order name
   * @param {Array} items - Array of sales order items
   */
  async saveSalesOrderItemsToDatabase(salesOrderName, items) {
    try {
      if (!items || items.length === 0) return;

      // Process items in batches to avoid overwhelming the database
      const itemBatches = batchItems(items, 50);
      
      for (const batch of itemBatches) {
        const upsertPromises = batch.map(item => {
          const itemData = mapSalesOrderItemToDatabase(item, salesOrderName);

          return this.db.ErpnextSalesOrderItem.upsert({
            where: {
              name: item.name
            },
            update: itemData,
            create: itemData
          });
        });

        // Execute batch upserts in parallel
        await Promise.all(upsertPromises);
      }

      logSyncProgress("success", `Successfully saved ${items.length} Sales Order Items for ${salesOrderName}`);
      
    } catch (error) {
      logSyncProgress("error", `Error saving Sales Order Items for ${salesOrderName}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Main sync method using KV to store last sync time for optimal incremental sync
   * @param {Object} options - Sync options
   * @returns {Object} Sync result
   */
  async syncSalesOrders(options = {}) {
    try {
      // Default options
      const {
        minutesBack = 10, // fallback: 10 minutes
        syncType = "auto", // 'auto', 'manual', 'frequent'
        kv = this.env.FN_KV // pass in KV namespace from env
      } = options;

      const KV_KEY = "sales_order_sync:last_date";
      const lastDate = await kv.get(KV_KEY) || null;

      if (lastDate) {
        logSyncProgress("info", `Last sync date found: ${lastDate}`);
      } else {
        logSyncProgress("info", "No previous sync date found. Performing initial sync.");
      }

      const { fromDate, toDate } = calculateDateRange(minutesBack, lastDate);
      const timeRange = formatTimeRange(minutesBack, lastDate);

      logSyncProgress("info", `Starting ${syncType} Sales Order sync for ${timeRange}...`);
      logSyncProgress("info", `Syncing Sales Orders from ${fromDate} to ${toDate}`);

      // Get Sales Orders Records 
      const salesOrders = await this.fetchSalesOrdersFromERP(fromDate, toDate);

      if (salesOrders.length === 0) {
        logSyncProgress("info", "No Sales Orders to sync");
        // Still update last_date to toDate, so next run is incremental
        await kv.put(KV_KEY, toDate);
        return createSyncResponse({ 
          synced: 0, 
          message: `No Sales Orders to sync (${timeRange})`,
          timeRange,
          minutesBack,
          syncType
        });
      }

      let syncedCount = 0;
      let errorCount = 0;

      // Process sales orders in batches
      const salesOrderBatches = batchItems(salesOrders, 10);
      
      for (const batch of salesOrderBatches) {
        const batchPromises = batch.map(async (salesOrder) => {
          try {
            // Save Sales Order
            await this.saveSalesOrderToDatabase(salesOrder);

            // Get Sales Order Details and save items
            const salesOrderDetails = await this.fetchSalesOrderDetails(salesOrder.name);
            if (salesOrderDetails && salesOrderDetails.items) {
              await this.saveSalesOrderItemsToDatabase(salesOrder.name, salesOrderDetails.items);
            }

            syncedCount++;
            logSyncProgress("success", `Synced Sales Order: ${salesOrder.name}`);

          } catch (error) {
            errorCount++;
            logSyncProgress("error", `Failed to sync Sales Order ${salesOrder.name}`, { error: error.message });
          }
        });

        // Process batch in parallel
        await Promise.all(batchPromises);
      }

      await kv.put(KV_KEY, toDate);

      const result = createSyncResponse({
        total: salesOrders.length,
        synced: syncedCount,
        errors: errorCount,
        timeRange,
        minutesBack,
        syncType,
        message: `${syncType}: ${syncedCount}/${salesOrders.length} Sales Orders (${timeRange})`
      });

      logSyncProgress("success", "Sales Order sync completed", result);
      return result;

    } catch (error) {
      logSyncProgress("error", "Sales Order sync failed", { error: error.message });
      return createSyncResponse({
        success: false,
        error: error.message,
        message: "Sales Order sync failed"
      });
    }
  }

  // ===== STATIC CONVENIENCE METHODS =====

  /**
   * Static method for daily sync with default parameters
   * @param {Object} env - Environment variables
   * @returns {Object} Sync result
   */
  static async syncDailySalesOrders(env) {
    const syncService = new SalesOrderService(env);
    return await syncService.syncSalesOrders({ 
      minutesBack: 1000, // fallback if no last_date
      syncType: "auto",
      // kv: env.FN_KV
    });
  }

  /**
   * Static method for manual sync with custom parameters
   * @param {Object} env - Environment variables
   * @param {Object} options - Sync options
   * @returns {Object} Sync result
   */
  static async syncManualSalesOrders(env, options = {}) {
    const syncService = new SalesOrderService(env);
    return await syncService.syncSalesOrders({ 
      syncType: "manual",
      kv: env.FN_KV,
      ...options
    });
  }

  // ===== UTILITY METHODS =====

  /**
   * Gets sync status from KV store
   * @returns {Object} Sync status information
   */
  async getSyncStatus() {
    try {
      const KV_KEY = "sales_order_sync:last_date";
      const lastDate = await this.env.FN_KV.get(KV_KEY);
      
      return {
        lastSyncDate: lastDate,
        nextSyncDue: lastDate ? new Date(Date.parse(lastDate) + 10 * 60 * 1000) : null, // 10 minutes from last sync
        isOverdue: lastDate ? Date.now() > (Date.parse(lastDate) + 10 * 60 * 1000) : true
      };
    } catch (error) {
      logSyncProgress("error", "Error getting sync status", { error: error.message });
      return null;
    }
  }

  /**
   * Resets sync status (useful for testing or manual resets)
   * @returns {boolean} Success status
   */
  async resetSyncStatus() {
    try {
      const KV_KEY = "sales_order_sync:last_date";
      await this.env.FN_KV.delete(KV_KEY);
      logSyncProgress("success", "Sync status reset successfully");
      return true;
    } catch (error) {
      logSyncProgress("error", "Error resetting sync status", { error: error.message });
      return false;
    }
  }
}
