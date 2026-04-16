export const shouldReceiveWebhook = (body) => {
  if (body?.event_type !== "messaging") {
    return false;
  }
  const pageId = body?.page_id;
  const senderId = body?.data?.message?.from?.id;

  // Ignore message from admin
  if (pageId == senderId) {
    return false;
  }

  const conversationId = body?.data?.conversation?.id;
  if (!conversationId || conversationId.trim() === "") {
    return false;
  }

  if (!pageId || pageId.trim() === "") {
    return false;
  }

  return true;
};
