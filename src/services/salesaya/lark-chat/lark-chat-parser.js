import { extractCodes, flattenContentText } from "services/salesaya/lark-chat/lark-chat-helper";

export default class LarkChatParser {
  constructor(larkClient) {
    this.lark = larkClient;
  }

  async parseThread(threadId) {
    let pageToken = "";
    const images = [];
    const files = [];
    const codes = [];

    let rootMessageId = null;
    let hasMore = true;

    while (hasMore) {
      const res = await this.lark.im.message.list({
        params: {
          container_id_type: "thread",
          container_id: threadId,
          page_size: 50,
          page_token: pageToken || undefined,
          sort_type: "ByCreateTimeAsc"
        }
      });

      const items = res?.data?.items || [];

      for (const msg of items) {
        if (!rootMessageId) rootMessageId = msg.message_id;

        let contentObj;
        try {
          contentObj = JSON.parse(msg.body.content);
        } catch {
          continue;
        }

        const text = flattenContentText(contentObj);
        if (text) {
          const found = extractCodes(text);
          if (found.length) codes.push(...found);
        }
        if (contentObj?.content && Array.isArray(contentObj.content)) {
          const blocks = contentObj?.content || [];
          for (const block of blocks) {
            for (const item of block) {
              if (item.tag === "img") {
                images.push({ message_id: msg.message_id, key: item.image_key });
              }
              if (item.tag === "media") {
                files.push({
                  message_id: msg.message_id,
                  key: item.file_key,
                  name: item.file_name || "file"
                });
              }
            }
          }
        }
        if (contentObj?.image_key) {
          images.push({ message_id: msg.message_id, key: contentObj.image_key });
        }
        if (contentObj?.file_key) {
          files.push({
            message_id: msg.message_id,
            key: contentObj.file_key,
            name: contentObj.file_name || "file"
          });
        }
      }

      pageToken = res?.data?.page_token || null;
      hasMore = !!pageToken;
    }

    return { codes, images, files };
  }
}
