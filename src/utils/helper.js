import { convertIsoToDatetime } from "../frappe/utils/datetime";

export function getGender(gender) {
  if (gender === "male") {
    return "Male";
  } else if (gender === "female") {
    return "Female";
  } else {
    return "Other";
  }
}

export function getBirthDate(birthday) {
  if (birthday) {
    try {
      const birthdayDate = new Date(birthday);
      if (!isNaN(birthdayDate) && birthdayDate.getFullYear() !== 1903) {
        return birthdayDate;
      }
    } catch (e) {
      // Invalid date
    }
  }
  return null;
}

export function convertConversationPayload(conversation) {
  const birthDate = getBirthDate(conversation.customer_birthday);

  let payload = {
    docstatus: 0,
    doctype: "Lead",
    gender: getGender(conversation.customer_gender),
    first_name: conversation.customer_name || "Chưa rõ",
    phone: conversation.customer_phone,
    pancake_data: {
      platform: conversation.platform,
      conversation_id: conversation.conversation_id,
      customer_id: conversation.customer_id,
      page_id: conversation.page_id,
      page_name: conversation.page_name,
      inserted_at: conversation.inserted_at
        ? convertIsoToDatetime(new Date(conversation.inserted_at).toISOString())
        : null,
      updated_at: conversation.updated_at
        ? convertIsoToDatetime(new Date(conversation.updated_at).toISOString())
        : null,
      can_inbox: conversation.can_inbox === true ? 1 : 0,
      latest_message_at: conversation.latest_message_at
        ? convertIsoToDatetime(
          new Date(conversation.latest_message_at).toISOString()
        )
        : null,
      pancake_user_id: conversation.pancake_user_id || null
    },
    pancake_tags: conversation.tags,
    address: conversation.customer_lives_in,
    birth_date: birthDate
  };

  if (conversation.frappe_name_id) {
    payload.doc_name = conversation.frappe_name_id;
  }

  let cleanPayload = filterEmptyValues(payload);
  return cleanPayload;
}

export function filterEmptyValues(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const isEmptyString = typeof value === "string" && value.trim() === "";
    const isEmptyArray = Array.isArray(value) && value.length === 0;
    const isEmptyObject =
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0;

    if (
      value !== null &&
      value !== undefined &&
      !isEmptyString &&
      !isEmptyArray &&
      !isEmptyObject
    ) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
