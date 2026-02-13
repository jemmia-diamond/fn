
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import InventoryCMSClient from "services/inventory-cms/inventory-cms-client/inventory-cms-client";
import { readItems } from "@directus/sdk";
import LarksuiteService from "services/larksuite/lark";
import * as Sentry from "@sentry/cloudflare";
import { TIMEZONE_VIETNAM } from "src/constants";

dayjs.extend(utc);
dayjs.extend(timezone);

const CHAT_IDS = {
  "[ALL]": "oc_db8f8e12857c28812d50e4f6166390e2",
  "[HCM]": "oc_189a0d4b8f7a2baf3dad242e3599a7f0",
  "[HN]": "oc_3770845e35194dde3e0ba76def59d1fe",
  "[CT]": "oc_25b872e3207f071d8c8aa064f895466c",
  "[TEST]": "oc_7f6dd355251aa766220a84dcae2403e1"
};

export default class CheckSheetNotificationService {
  static async processInventoryCheck(payload, env) {
    const { warehouse, staff: staffId, lines = [] } = payload;
    const alertedLines = lines.filter(l => l.count_in_book > l.count_for_real || l.count_extra_for_real);
    const staffName = await this.getStaffName(staffId, env);
    const messageText = this.composeMessage(payload, alertedLines, staffName);
    const targetChatId = this.getTargetChatId(warehouse);
    await this.sendNotification(env, targetChatId, messageText);

    return { success: true, alertedLines: alertedLines.length };
  }

  static async getStaffName(staffId, env) {
    const client = await InventoryCMSClient.createClient(env);
    const staffs = await client.request(readItems("staffs", { limit: -1 }));

    const staff = staffs?.find(s => s.id === staffId);
    if (staff) {
      return `${staff.last_name || ""} ${staff.first_name || ""}`.trim();
    } else {
      Sentry.captureMessage(`InventoryNotificationService: Staff not found: ${staffId}`);
      return "Không thấy thông tin nhân viên";
    }
  }

  static composeMessage(payload, alertedLines, staffName) {
    const {
      warehouse,
      code,
      count_in_book: countInBook,
      count_for_real: countForReal,
      created_at: createdAt
    } = payload;

    const timeToFormat = createdAt || new Date();
    const dateStr = dayjs(timeToFormat).tz(TIMEZONE_VIETNAM).format("DD/MM/YYYY HH:mm:ss");

    const gap = countForReal - countInBook;
    const gapText = gap > 0 ? `Dư ${gap}` : (gap < 0 ? `Thiếu ${-gap}` : "đủ hàng");

    const headInfo = {
      [`[${dateStr}]`]: `<b>${warehouse}</b> | <b>${code}</b>`,
      "- Tồn kho (thực tế/haravan)": `${countForReal}/${countInBook} (${gapText})`,
      "- Tem RFID quét dư": payload.extra || 0
    };

    const messageHead = this.textJoin(headInfo, "\n");
    const messageLines = alertedLines
      .map(l => this.textJoin(this.lineMapping(l), "\n"))
      .join("\n\n");

    const staffInfo = `- Nhận sự phụ trách chính: ${staffName}`;

    return [messageHead, messageLines, staffInfo]
      .filter(p => p && p.trim() !== "")
      .join("\n\n")
      .trim();
  }

  static lineMapping(line) {
    const lGap = line.count_for_real - line.count_in_book;
    return {
      "Sản phẩm": line.product_name || line.name || "N/A",
      "Barcode": line.barcode || "N/A",
      "SKU": line.sku || "N/A",
      "Tồn kho lấy từ Haravan": line.count_in_book,
      "Tồn kho thực tế": `${line.count_for_real} (${lGap})`,
      "Tem RFID quét dư": line.count_extra_for_real,
      "Số lượng đã được đặt": line.count_in_ordered
    };
  }

  static textJoin(obj, delimiter) {
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(delimiter);
  }

  static getTargetChatId(warehouse) {
    if (!warehouse) return CHAT_IDS["[TEST]"];
    if (warehouse.includes("[HCM]")) return CHAT_IDS["[HCM]"];
    if (warehouse.includes("[HN]")) return CHAT_IDS["[HN]"];
    if (warehouse.includes("[CT]")) return CHAT_IDS["[CT]"];
    return CHAT_IDS["[ALL]"];
  }

  static async sendNotification(env, chatId, messageText) {
    const larkClient = await LarksuiteService.createClientV2(env);
    await larkClient.im.message.create({
      params: { receive_id_type: "chat_id" },
      data: {
        receive_id: chatId,
        msg_type: "text",
        content: JSON.stringify({ text: messageText })
      }
    });
  }
}
