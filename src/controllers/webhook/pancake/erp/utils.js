import { PROMO_REGEX } from "src/constants/pancake";

export const shouldReceiveWebhook = (body) => {
  if (body?.event_type !== "messaging") {
    return false;
  }

  const adminId = body?.data?.message?.from?.admin_id;
  // Ignore message from admin
  if (adminId) {
    return false;
  }

  const conversationId = body?.data?.conversation?.id;
  if (!conversationId || conversationId.trim() === "") {
    return false;
  }

  const pageId = body?.page_id;
  if (!pageId || pageId.trim() === "") {
    return false;
  }

  return true;
};

/**
 * Checks if a message contains promotional keywords.
 * @param {string} text
 * @returns {boolean}
 */
export const isPromotionalMessage = (text) => {
  if (!text) return false;
  return PROMO_REGEX.test(text);
};
