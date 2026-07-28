export const shouldReceiveWebhook = (body, shouldIgnoreAdmin = true) => {
  if (body?.event_type !== "messaging") {
    return false;
  }
  const pageId = body?.page_id;
  const senderId = body?.data?.message?.from?.id;

  // Ignore message from admin
  if (pageId == senderId && shouldIgnoreAdmin) {
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

export const shouldSendToCustomerLens = (body) => {
  const isValidMessage = shouldReceiveWebhook(body, false);
  const from = body?.data?.conversation?.from?.email;
  if (isValidMessage && from?.endsWith("facebook.com")) {
    return true;
  }
  return false;
};
