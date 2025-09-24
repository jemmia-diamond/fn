import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { Prisma } from "@prisma-cli";
import { randomUUID } from "crypto";
import { mapAddressesToDatabase } from "src/services/erp/contacts/address/utils/address-mappers";
import { escapeSqlValue } from "src/services/utils/sql-helpers";
dayjs.extend(utc);

const CHUNK_SIZE = 500;

export async function fetchAddressesFromERP(frappeClient, doctype, fromDate, toDate, pageSize) {
  try {
    const filters = {};
    filters["modified"] = [">=", fromDate];
    if (toDate) {
      filters["modified"] = ["between", [fromDate, toDate]];
    }
    let allAddresses = [];
    let start = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const addressesBatch = await frappeClient.getList(doctype, {
        filters: filters,
        limit_start: start,
        limit_page_length: pageSize,
        order_by: "creation desc"
      });

      if (addressesBatch?.length) {
        const addressNames = addressesBatch.map(address => address.name);
        const addressLinks = await fetchAddressChildRecordsFromERP(frappeClient, addressNames, "tabDynamic Link");

        // group address links by address name
        const addressLinksMap = {};
        addressLinks.forEach(item => {
          if (!addressLinksMap[item.parent]) {
            addressLinksMap[item.parent] = [];
          }
          addressLinksMap[item.parent].push(item);
        });

        // add address links to each address in addressesBatch
        addressesBatch.forEach(address => {
          address.links = addressLinksMap[address.name] || [];
        });

        allAddresses.push(...addressesBatch);
        hasMoreData = addressesBatch.length === pageSize;
        start += pageSize;
      } else {
        hasMoreData = false;
      }
    }
    return allAddresses;
  } catch (error) {
    console.error("Error fetching addresses from ERPNext", { error: error.message });
    throw error;
  }
}

// Function to fetch child records from ERPNext
export async function fetchAddressChildRecordsFromERP(frappeClient, addressNames, tableName) {
  if (!Array.isArray(addressNames) || addressNames.length === 0) {
    return [];
  }
  const quotedNames = addressNames.map(name => `"${name}"`).join(", ");
  const sql = `SELECT * FROM \`${tableName}\` WHERE parent IN (${quotedNames})`;
  const addressChildRecords = await frappeClient.executeSQL(sql);
  return addressChildRecords || [];
}

export async function saveAddressesToDatabase(db, addresses) {
  try {
    const addressesData = mapAddressesToDatabase(addresses);
    if (addressesData.length === 0) {
      return;
    }

    // Process in chunks to avoid SQL statement size limits
    for (let i = 0; i < addressesData.length; i += CHUNK_SIZE) {
      const chunk = addressesData.slice(i, i + CHUNK_SIZE);

      // Get fields including both database timestamp columns for INSERT
      const fields = ["uuid", ...Object.keys(chunk[0]).filter(field =>
        field !== "database_created_at" && field !== "database_updated_at"
      ), "database_created_at", "database_updated_at"];
      const fieldsSql = fields.map(field => `"${field}"`).join(", ");

      // Create VALUES clause with generated UUIDs and timestamps
      const currentTimestamp = new Date();
      const values = chunk.map(address => {
        const addressWithTimestamps = {
          uuid: randomUUID(),
          ...address,
          database_created_at: currentTimestamp,
          database_updated_at: currentTimestamp
        };
        const fieldValues = fields.map(field => escapeSqlValue(addressWithTimestamps[field]));
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
        INSERT INTO "erpnext"."addresses" (${fieldsSql})
        VALUES ${values}
        ON CONFLICT (name) DO UPDATE SET
        ${updateSetSql};
      `;
      await db.$queryRaw`${Prisma.raw(query)}`;
    }

  } catch (error) {
    console.error("Error saving addresses to database:", error.message);
  }
}
