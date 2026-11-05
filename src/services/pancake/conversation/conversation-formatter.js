/**
 * Formats a raw Pancake messages array into the compact shape the lead-extraction
 * LLM expects: [{ role, message, time }].
 *
 * Ported verbatim from the AI Hub service (aihub/backend conversation-service.js
 * formatMessages/determineMessageRole/formatMessageContent/formatTimestamp), which
 * the n8n "Lead Info Extractor" relied on, so output stays byte-identical to the
 * previous pipeline.
 */

const FROM_SYSTEM_MESSAGES = [
  "Zalo chỉ hiển thị tin nhắn từ sau lần đăng nhập đầu tiên"
];

function determineMessageRole(message, pageId) {
  if (FROM_SYSTEM_MESSAGES.includes(message.original_message)) {
    return "system";
  }

  if (message.from?.id !== pageId) {
    return "user";
  } else if (message.from?.admin_name) {
    return "assistant";
  } else {
    return "system";
  }
}

function formatMessageContent(messages, message, index, role) {
  let content = message.original_message;

  if (content === "" && message.attachments?.length > 0) {
    content = message.attachments
      .map((a) => `[${a.name || "Media"}]`)
      .join(" ");
  }

  if (role === "system" && index > 0) {
    const previousMessage = messages[index - 1];

    if (previousMessage.attachments?.length > 0) {
      content = `${content} "${previousMessage.attachments[0].name}"`;
    }
  }

  return content;
}

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return null;
  }

  return timestamp.replace("T", " ").split(".")[0];
}

/**
 * @param {Array<object>} messages - raw Pancake messages (res.messages)
 * @param {string} pageId - the Pancake page id (used to tell customer vs staff)
 * @returns {Array<{role: string, message: string, time: string|null}>}
 */
export function formatPancakeMessages(messages, pageId) {
  const result = [];

  (messages || []).forEach((message, index) => {
    const isMediaOnly =
      message.original_message === "" &&
      message.message === "<div></div>" &&
      message.attachments?.length > 0;

    if (message.original_message === "" && !isMediaOnly) {
      return;
    }

    const role = determineMessageRole(message, pageId);
    const content = formatMessageContent(messages, message, index, role);
    const time = formatTimestamp(message.inserted_at);

    result.push({ role, message: content, time });
  });

  return result;
}
