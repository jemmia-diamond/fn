export const shouldReceiveWebhook = (body) => {
  if (body?.event_type !== "messaging") {
    return false;
  }

  const pageCustomerId = body?.data?.message?.from?.page_customer_id;
  // Ignore message from admin
  if (!pageCustomerId) {
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
