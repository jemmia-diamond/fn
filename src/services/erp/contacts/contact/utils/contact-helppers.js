import * as Sentry from "@sentry/cloudflare";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { Prisma } from "@prisma-cli";
import { randomUUID } from "crypto";
import { mapContactsToDatabase } from "src/services/erp/contacts/contact/utils/contact-mappers";
import { escapeSqlValue } from "src/services/utils/sql-helpers";
dayjs.extend(utc);

const CHUNK_SIZE = 50;

function buildTrackingInfo(contact) {
  const TRACKING_KEYS = [
    "unsubscribed",
    "is_replied",
    "pancake_conversation_id",
    "pancake_inserted_at",
    "pancake_updated_at",
    "pancake_customer_id",
    "thread_id",
    "can_inbox",
    "pancake_page_id",
    "ad_ids",
    "custom_uuid",
    "page_url",
    "user_agent",
    "remote_ip",
    "form_id",
    "form_name",
    "form_inserted_at",
    "form_updated_at",
    "ip",
    "gtm_link",
    "gtm_location",
    "url_page",
    "utm_term",
    "message_id",
    "utm_medium",
    "utm_source",
    "utm_content",
    "variant_url",
    "ladi_form_id",
    "message_time",
    "utm_campaign",
    "origin_url_page",
    "variant_content",
    "referrer",
    "last_source",
    "first_source",
    "last_ad_param",
    "conversion_url",
    "first_ad_param",
    "gclid",
    "fbclid",
    "ttclid",
    "gbraid",
    "gad_source",
    "gad_campaignid",
    "ga_client_id",
    "fb_client_id",
    "ladi_client_id",
    "gcl_au_id",
    "stringee_id",
    "stringee_to_number",
    "stringee_from_number",
    "stringee_start_time",
    "stringee_end_time",
    "stringee_from_internal",
    "stringee_to_internal",
    "stringee_recorded",
    "video_call",
    "pulled_from_google_contacts"
  ];
  const result = {};
  for (const key of TRACKING_KEYS) {
    const val = contact[key];
    result[key] = val !== undefined && val !== null && val !== "" ? val : null;
  }
  return result;
}

export async function fetchContactsFromERP(frappeClient, doctype, fromDate, toDate, pageSize) {
  try {
    const filters = {};
    filters["modified"] = [">=", fromDate];
    if (toDate) {
      filters["modified"] = ["between", [fromDate, toDate]];
    }
    let allContacts = [];
    let start = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const contactsBatch = await frappeClient.getList(doctype, {
        filters: filters,
        limit_start: start,
        limit_page_length: pageSize,
        order_by: "creation desc"
      });

      if (contactsBatch?.length) {
        const contactNames = contactsBatch.map(contact => contact.name);
        const contactPhoneNos = await fetchContactChildRecordsFromERP(frappeClient, contactNames, "tabContact Phone");
        const contactEmails = await fetchContactChildRecordsFromERP(frappeClient, contactNames, "tabContact Email");
        const contactLinks = await fetchContactChildRecordsFromERP(frappeClient, contactNames, "tabDynamic Link");

        // group contact phone nos by contact name
        const contactPhoneNosMap = {};
        contactPhoneNos.forEach(item => {
          if (!contactPhoneNosMap[item.parent]) {
            contactPhoneNosMap[item.parent] = [];
          }
          contactPhoneNosMap[item.parent].push(item);
        });

        // group contact emails by contact name
        const contactEmailsMap = {};
        contactEmails.forEach(item => {
          if (!contactEmailsMap[item.parent]) {
            contactEmailsMap[item.parent] = [];
          }
          contactEmailsMap[item.parent].push(item);
        });

        // group contact links by contact name
        const contactLinksMap = {};
        contactLinks.forEach(item => {
          if (!contactLinksMap[item.parent]) {
            contactLinksMap[item.parent] = [];
          }
          contactLinksMap[item.parent].push(item);
        });

        // add contact phone nos to each contact in contactsBatch
        contactsBatch.forEach(contact => {
          contact.phone_nos = contactPhoneNosMap[contact.name] || [];
          contact.emails = contactEmailsMap[contact.name] || [];
          contact.links = contactLinksMap[contact.name] || [];
        });
        // add tracking info to each contact in contactsBatch
        contactsBatch.forEach(contact => {
          contact.tracking_info = buildTrackingInfo(contact);
        });

        allContacts.push(...contactsBatch);
        hasMoreData = contactsBatch.length === pageSize;
        start += pageSize;
      } else {
        hasMoreData = false;
      }
    }
    return allContacts;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}

// Function to fetch child records from ERPNext
export async function fetchContactChildRecordsFromERP(frappeClient, contactNames, tableName) {
  if (!Array.isArray(contactNames) || contactNames.length === 0) {
    return [];
  }
  const quotedNames = contactNames.map(name => `"${name}"`).join(", ");
  const sql = `SELECT * FROM \`${tableName}\` WHERE parent IN (${quotedNames})`;
  const contactChildRecords = await frappeClient.executeSQL(sql);
  return contactChildRecords || [];
}

export async function saveContactsToDatabase(db, contacts) {
  try {
    const contactsData = mapContactsToDatabase(contacts);
    if (contactsData.length === 0) {
      return;
    }

    // Process in chunks to avoid SQL statement size limits
    for (let i = 0; i < contactsData.length; i += CHUNK_SIZE) {
      const chunk = contactsData.slice(i, i + CHUNK_SIZE);

      // Get fields including both database timestamp columns for INSERT
      const fields = ["uuid", ...Object.keys(chunk[0]).filter(field =>
        field !== "database_created_at" && field !== "database_updated_at"
      ), "database_created_at", "database_updated_at"];
      const fieldsSql = fields.map(field => `"${field}"`).join(", ");

      // Create VALUES clause with generated UUIDs and timestamps
      const currentTimestamp = new Date();
      const values = chunk.map(contact => {
        const contactWithTimestamps = {
          uuid: randomUUID(),
          ...contact,
          database_created_at: currentTimestamp,
          database_updated_at: currentTimestamp
        };
        const fieldValues = fields.map(field => escapeSqlValue(contactWithTimestamps[field]));
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
        INSERT INTO "erpnext"."contacts" (${fieldsSql})
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

export async function deleteContactFromDatabase(db, contactName) {
  try {
    const contact = await db.erpnextContact.findUnique({
      where: { name: contactName }
    });
    if (contact) {
      await db.erpnextContact.delete({
        where: { name: contactName }
      });
    }
  } catch (error) {
    Sentry.captureException(error);
  }
}
