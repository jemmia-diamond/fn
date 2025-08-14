import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { randomUUID } from "crypto";
import { mapLeadsToDatabase } from "services/erp/crm/lead/utils/lead-mappers";
dayjs.extend(utc);

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

// Helper function to escape SQL values
function escapeSqlValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  } else if (typeof value === "string") {
    return `"${value.replace(/"/g, "\"\"")}"`;
  } else if (value instanceof Date) {
    return `"${value.toISOString()}"`;
  } else if (typeof value === "boolean") {
    return value ? "1" : "0";
  } else if (Array.isArray(value) || typeof value === "object") {
    return `"${JSON.stringify(value).replace(/"/g, "\"\"")}"`;
  }
  return value;
}

export async function saveLeadsToDatabase(db, leads) {
  try {
    const leadsData = mapLeadsToDatabase(leads);
    if (leadsData.length === 0) {
      return;
    }
    
    // Process in chunks to avoid SQL statement size limits
    const chunkSize = 500;
    for (let i = 0; i < leadsData.length; i += chunkSize) {
      const chunk = leadsData.slice(i, i + chunkSize);
      
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
      }).join(", ");
      
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
      await db.$executeRawUnsafe(query);
    }
    
    console.error(`Successfully upserted ${leadsData.length} leads to database`);
  } catch (error) {
    console.error("Error saving leads to database:", error.message);
    throw error;
  }
} 
