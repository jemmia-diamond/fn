export const shouldReceiveWebhook = (body) => {
  if (body?.event_type !== "messaging") {
    return false;
  }

  const adminName = body?.data?.message?.from?.admin_name;
  // Ignore message from admin
  if (adminName) {
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
