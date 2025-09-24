import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { Prisma } from "@prisma-cli";
import { randomUUID } from "crypto";
import { mapLeadsToDatabase } from "src/services/erp/crm/lead/utils/lead-mappers";
import { escapeSqlValue } from "src/services/utils/sql-helpers";
dayjs.extend(utc);

const CHUNK_SIZE = 500;

export async function fetchLeadsFromERP(frappeClient, doctype, fromDate, toDate, pageSize) {
  try {
    const filters = {};
    filters["modified"] = [">=", fromDate];
    if (toDate) {
      filters["modified"] = ["between", [fromDate, toDate]];
    }
    let allLeads = [];
    let start = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const leadsBatch = await frappeClient.getList(doctype, {
        filters: filters,
        limit_start: start,
        limit_page_length: pageSize,
        order_by: "creation desc"
      });

      if (leadsBatch?.length) {
        const leadNames = leadsBatch.map(lead => lead.name);
        const leadProductItems = await fetchLeadProductItemsFromERP(frappeClient, leadNames);

        // group leadProductItems by lead name
        const leadProductItemsMap = {};
        leadProductItems.forEach(item => {
          if (!leadProductItemsMap[item.parent]) {
            leadProductItemsMap[item.parent] = [];
          }
          leadProductItemsMap[item.parent].push(item);
        });

        // add leadProductItems to each lead in leadsBatch
        leadsBatch.forEach(lead => {
          lead.preferred_product_type = leadProductItemsMap[lead.name] || [];
        });

        allLeads.push(...leadsBatch);
        hasMoreData = leadsBatch.length === pageSize;
        start += pageSize;
      } else {
        hasMoreData = false;
      }
    }
    return allLeads;
  } catch (error) {
    console.error("Error fetching leads from ERPNext", { error: error.message });
    throw error;
  }
}
export async function fetchLeadProductItemsFromERP(frappeClient, leadNames) {
  if (!Array.isArray(leadNames) || leadNames.length === 0) {
    return [];
  }
  const quotedNames = leadNames.map(name => `"${name}"`).join(", ");
  const sql = `SELECT * FROM \`tabLead Product Item\` WHERE parent IN (${quotedNames})`;
  const leadProductItems = await frappeClient.executeSQL(sql);
  return leadProductItems || [];
}

export async function saveLeadsToDatabase(db, leads) {
  try {
    const leadsData = mapLeadsToDatabase(leads);
    if (leadsData.length === 0) {
      return;
    }

    // Process in chunks to avoid SQL statement size limits
    for (let i = 0; i < leadsData.length; i += CHUNK_SIZE) {
      const chunk = leadsData.slice(i, i + CHUNK_SIZE);

      // Get fields including both database timestamp columns for INSERT
      const fields = ["uuid", ...Object.keys(chunk[0]).filter(field =>
        field !== "database_created_at" && field !== "database_updated_at"
      ), "database_created_at", "database_updated_at"];
      const fieldsSql = fields.map(field => `"${field}"`).join(", ");

      // Create VALUES clause with generated UUIDs and timestamps
      const currentTimestamp = new Date();
      const values = chunk.map(lead => {
        const leadWithTimestamps = {
          uuid: randomUUID(),
          ...lead,
          database_created_at: currentTimestamp,
          database_updated_at: currentTimestamp
        };
        const fieldValues = fields.map(field => escapeSqlValue(leadWithTimestamps[field]));
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
        INSERT INTO "erpnext"."leads" (${fieldsSql})
        VALUES ${values}
        ON CONFLICT (name) DO UPDATE SET
        ${updateSetSql};
      `;
      await db.$queryRaw`${Prisma.raw(query)}`;
    }

  } catch (error) {
    console.error("Error saving leads to database:", error.message);
  }
}

export function areAllFieldsEmpty(obj) {
  if (!obj || typeof obj !== "object") {
    return true;
  }

  return Object.values(obj).every(
    value =>
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0)
  );
}

