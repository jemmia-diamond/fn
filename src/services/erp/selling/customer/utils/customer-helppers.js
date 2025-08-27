import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { Prisma } from "@prisma-cli";
import { randomUUID } from "crypto";
import { mapCustomersToDatabase } from "src/services/erp/selling/customer/utils/customer-mappers";
import { fetchChildRecordsFromERP } from "src/services/utils/sql-helpers";
import { escapeSqlValue } from "src/services/utils/sql-helpers";
dayjs.extend(utc);

const CHUNK_SIZE = 500;

export async function fetchCustomersFromERP(frappeClient, doctype, fromDate, toDate, pageSize) {
  try {
    const filters = {};
    filters["modified"] = [">=", fromDate];
    if (toDate) {
      filters["modified"] = ["between", [fromDate, toDate]];
    }
    let allCustomers = [];
    let start = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const customersBatch = await frappeClient.getList(doctype, {
        filters: filters,
        limit_start: start,
        limit_page_length: pageSize,
        order_by: "creation desc"
      });

      if (customersBatch?.length) {
        const customerNames = customersBatch.map(customer => customer.name);
        const customerCoupons = await fetchChildRecordsFromERP(frappeClient, customerNames, "tabCoupon") || [];

        // group customer coupons by customer name
        const customerCouponsMap = {};
        customerCoupons.forEach(item => {
          if (!customerCouponsMap[item.parent]) {
            customerCouponsMap[item.parent] = [];
          }
          customerCouponsMap[item.parent].push(item);
        });

        // add customer coupons to each customer in customersBatch
        customersBatch.forEach(customer => {
          customer.coupons = customerCouponsMap[customer.name] || [];
        });

        allCustomers.push(...customersBatch);
        hasMoreData = customersBatch.length === pageSize;
        start += pageSize;
      } else {
        hasMoreData = false;
      }
    }
    return allCustomers;
  } catch (error) {
    console.error("Error fetching customers from ERPNext", { error: error.message });
    throw error;
  }
}

export async function saveCustomersToDatabase(db, customers) {
  try {
    const customersData = mapCustomersToDatabase(customers);
    if (customersData.length === 0) {
      return;
    }

    // Process in chunks to avoid SQL statement size limits
    for (let i = 0; i < customersData.length; i += CHUNK_SIZE) {
      const chunk = customersData.slice(i, i + CHUNK_SIZE);

      // Get fields including both database timestamp columns for INSERT
      const fields = ["uuid", ...Object.keys(chunk[0]).filter(field =>
        field !== "database_created_at" && field !== "database_updated_at"
      ), "database_created_at", "database_updated_at"];
      const fieldsSql = fields.map(field => `"${field}"`).join(", ");

      // Create VALUES clause with generated UUIDs and timestamps
      const currentTimestamp = new Date();
      const values = chunk.map(customer => {
        const customerWithTimestamps = {
          uuid: randomUUID(),
          ...customer,
          database_created_at: currentTimestamp,
          database_updated_at: currentTimestamp
        };
        const fieldValues = fields.map(field => escapeSqlValue(customerWithTimestamps[field]));
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
        INSERT INTO "erpnext"."customers" (${fieldsSql})
        VALUES ${values}
        ON CONFLICT (name) DO UPDATE SET
        ${updateSetSql};
      `;
      await db.$queryRaw(Prisma.raw(query));
    }

  } catch (error) {
    console.error("Error saving customers to database:", error.message);
  }
}
