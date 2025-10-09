export const shouldReceiveWebhook = (body) => {
  if (body?.event_type === "messaging") {
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
