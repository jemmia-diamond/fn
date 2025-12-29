import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export function getGender(gender) {
  if (gender === "male") {
    return "Male";
  } else if (gender === "female") {
    return "Female";
  } else {
    return "Other";
  }
}

export function getPlatform(pageId, platform) {
  const zaloKocPages = [
    "pzl_488577139896879905",
    "pzl_833581016608002860",
    "pzl_779852793569717677",
    "pzl_414930725736878626"
  ];
  if (platform === "personal_zalo" && zaloKocPages.includes(pageId)) {
    return "personal_zalo_koc";
  }
  return platform;
}

export function getBirthDate(birthday) {
  if (birthday) {
    try {
      const birthdayDate = dayjs(birthday, "YYYY-MM-DD");
      if (birthdayDate.isValid() && birthdayDate.year() !== 1903) {
        return birthdayDate.format("YYYY-MM-DD");
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function createInsertLeadPayload(conversation) {
  const birthDate = getBirthDate(conversation.customer_birthday);
  const payload = {
    "doctype": "Lead",
    "naming_series": "CRM-LEAD-.YYYY.-",
    "status": "Lead",
    "gender": getGender(conversation.customer_gender),
    "first_name": conversation.customer_name || "Chưa rõ",
    "phone": conversation.customer_phone,
    "image": (conversation.pancake_avatar_url && conversation.pancake_avatar_url !== "https:") ? conversation.pancake_avatar_url : null,
    "pancake_data": {
      "platform": getPlatform(conversation.page_id, conversation.platform),
      "conversation_id": conversation.conversation_id,
      "customer_id": conversation.customer_id,
      "page_id": conversation.page_id,
      "page_name": conversation.page_name,
      "inserted_at": conversation.inserted_at ? dayjs(conversation.inserted_at).utc().format("YYYY-MM-DD HH:mm:ss") : null,
      "updated_at": conversation.updated_at ? dayjs(conversation.updated_at).utc().format("YYYY-MM-DD HH:mm:ss") : null,
      "can_inbox": conversation.can_inbox === true ? 1 : 0,
      "latest_message_at": conversation.latest_message_at ? dayjs(conversation.latest_message_at).utc().format("YYYY-MM-DD HH:mm:ss") : null,
      "pancake_user_id": conversation.pancake_user_id || null,
      "pancake_avatar_url": (conversation.pancake_avatar_url && conversation.pancake_avatar_url !== "https:") ? conversation.pancake_avatar_url : null
    },
    "pancake_tags": conversation.tags,
    "address": conversation.customer_lives_in,
    "birth_date": birthDate
  };

  return cleanPayload(payload);
}

export function createUpdateLeadPayload(conversation) {
  const birthDate = getBirthDate(conversation.customer_birthday);
  const payload = {
    "doctype": "Lead",
    "gender": getGender(conversation.customer_gender),
    "first_name": conversation.customer_name || "Chưa rõ",
    "phone": conversation.customer_phone,
    "image": (conversation.pancake_avatar_url && conversation.pancake_avatar_url !== "https:") ? conversation.pancake_avatar_url : null,
    "pancake_data": {
      "platform": getPlatform(conversation.page_id, conversation.platform),
      "conversation_id": conversation.conversation_id,
      "customer_id": conversation.customer_id,
      "page_id": conversation.page_id,
      "page_name": conversation.page_name,
      "inserted_at": conversation.inserted_at ? dayjs(conversation.inserted_at).utc().format("YYYY-MM-DD HH:mm:ss") : null,
      "updated_at": conversation.updated_at ? dayjs(conversation.updated_at).utc().format("YYYY-MM-DD HH:mm:ss") : null,
      "can_inbox": conversation.can_inbox === true ? 1 : 0,
      "latest_message_at": conversation.latest_message_at ? dayjs(conversation.latest_message_at).utc().format("YYYY-MM-DD HH:mm:ss") : null,
      "pancake_user_id": conversation.pancake_user_id || null,
      "pancake_avatar_url": (conversation.pancake_avatar_url && conversation.pancake_avatar_url !== "https:") ? conversation.pancake_avatar_url : null
    },
    "pancake_tags": conversation.tags,
    "address": conversation.customer_lives_in,
    "birth_date": birthDate,
    "docname": conversation.frappe_name_id
  };

  return cleanPayload(payload);
}

function cleanPayload(payload) {
  const cleaned = {};
  for (const [key, value] of Object.entries(payload)) {
    if (
      value !== "" &&
            value !== null &&
            !(Array.isArray(value) && value.length === 0) &&
            !(typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length === 0)
    ) {
      if (
        typeof value === "boolean" ||
                typeof value === "number" ||
                (typeof value === "string" && value.trim() !== "") ||
                (typeof value === "object" && value !== null)
      ) {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}
