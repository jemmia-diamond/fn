import RecordService from "services/larksuite/docs/base/record/record";
import LarkChatResourceFetcher from "services/salesaya/lark-chat/lark-chat-resource-fetcher";
import LarkChatMediaUploader from "services/salesaya/lark-chat/lark-chat-media-uploader";
import LarkChatParser from "services/salesaya/lark-chat/lark-chat-parser";
import { TABLES } from "services/larksuite/docs/constant";
import { getFilename } from "services/salesaya/lark-chat/lark-chat-helper";
import { WorkplaceClient } from "services/clients/workplace-client";

export default class LarkChatSyncService {
  constructor(env, larkAxiosClient, larkSdkClient) {
    this.env = env;
    this.larkAxiosClient = larkAxiosClient;
    this.larkSdkClient = larkSdkClient;
    this.appToken = TABLES.SALESAYA_MEDIA.app_token;
    this.tableId = TABLES.SALESAYA_MEDIA.table_id;
    this.workplaceBaseId = this.env.NOCODB_MARKETING_BASE_ID;
    this.workplaceBaseUrl = this.env.NOCODB_WORKPLACE_BASE_URL;
    this.fetcher = new LarkChatResourceFetcher(env, larkAxiosClient);
    this.uploader = new LarkChatMediaUploader(`${this.env.SALESAYA_API_BASE_URL}/files/upload`);
    this.parser = new LarkChatParser(larkSdkClient);
  }
  async writeRecord(code, links, status, reason = "", messageId = "") {
    await RecordService.createLarksuiteRecords({
      env: this.env,
      appToken: this.appToken,
      tableId: this.tableId,
      records: [
        {
          "Mã sản phẩm": code,
          "Hình ảnh/Video": links,
          "Trạng thái": status,
          "Lí do": reason,
          "Message ID": messageId
        }
      ]
    });
  };
  async syncChat(chatId, startTime, endTime) {
    const workplaceClient = await WorkplaceClient.initialize(this.env, this.workplaceBaseId);
    let pageToken = "";
    let hasMore = true;
    if (!startTime || !endTime) {
      throw new Error("Missing start time or end time");
    }
    while (hasMore) {
      const res = await this.larkSdkClient.im.message.list({
        params: {
          container_id_type: "chat",
          container_id: chatId,
          page_size: 50,
          page_token: pageToken || undefined,
          sort_type: "ByCreateTimeDesc",
          start_time: startTime,
          end_time: endTime
        }
      });

      const items = res?.data?.items || [];

      for (const msg of items) {
        if (!msg.thread_id) continue;

        const parsed = await this.parser.parseThread(msg.thread_id);

        if (parsed.codes.length === 0) continue;
        const uniqueCodes = [...new Set(parsed.codes.map(c => c.trim()))];
        const buffersCache = {};
        const imageLinks = [];
        const fileLinks = [];

        for (let i = 0; i < parsed.images.length; i++) {
          const img = parsed.images[i];
          const key = `${img.message_id}_${img.key}`;

          if (!buffersCache[key]) {
            buffersCache[key] = await this.fetcher.getBufferByKey(
              img.message_id,
              img.key,
              "image"
            );
          }

          const filename = getFilename(parsed.codes[0], i + 1, "jpg");
          const link = await this.uploader.upload(buffersCache[key], filename);
          if (link) imageLinks.push(link);
        }

        for (let i = 0; i < parsed.files.length; i++) {
          const f = parsed.files[i];
          const key = `${f.message_id}_${f.key}`;

          if (!buffersCache[key]) {
            buffersCache[key] = await this.fetcher.getBufferByKey(
              f.message_id,
              f.key,
              "file"
            );
          }

          const filename = getFilename(parsed.codes[0], i + 1, "mp4");
          const link = await this.uploader.upload(buffersCache[key], filename);
          if (link) fileLinks.push(link);
        }

        const links = [...imageLinks, ...fileLinks].join(", ");
        if (uniqueCodes.length === 1) {
          const updated = await workplaceClient.designImages.updateMediaByDesignCode(uniqueCodes[0], fileLinks, imageLinks);
          if (!updated) {
            let existDesign = await workplaceClient.designs.getByDesignCode(uniqueCodes[0]);
            if (existDesign === null) {
              existDesign = await workplaceClient.designs.getByErpCode(uniqueCodes[0]);
            }
            if (existDesign === null) {
              existDesign = await workplaceClient.designs.getByCode(uniqueCodes[0]);
            }
            if (existDesign !== null) {
              await workplaceClient.designImages.createByDesignCode(existDesign, fileLinks, imageLinks);
            } else {
              await this.writeRecord(uniqueCodes[0], links, "Thất bại", "Không thể get thông tin sản phẩm từ nocodb", msg.message_id);
              continue;
            }
          }
          await this.writeRecord(uniqueCodes[0], links, "Thành công", "", msg.message_id);
        } else {
          await this.writeRecord(uniqueCodes.join(", "), links, "Thất bại", "Tin nhắn chứa nhiều mã sản phẩm", msg.message_id);
        }
      }

      pageToken = res?.data?.page_token || null;
      hasMore = !!pageToken;
    }
  }
}
