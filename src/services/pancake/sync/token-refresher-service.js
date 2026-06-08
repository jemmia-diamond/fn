import PancakeClient from "pancake/pancake-client";
import * as Sentry from "@sentry/cloudflare";
import LarksuiteService from "services/larksuite/lark";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { TIMEZONE_VIETNAM } from "src/constants";

dayjs.extend(utc);
dayjs.extend(timezone);

export default class PancakeTokenRefresherService {
  constructor(env) {
    this.env = env;
    this.pancakeClient = new PancakeClient(env);
  }

  async run() {
    try {
      console.warn("Starting Pancake Token Refresher...");

      const pagesResponse = await this.pancakeClient.getPages();
      const categorized = pagesResponse?.categorized;
      const pages = [
        ...(categorized?.activated || []),
        ...(categorized?.inactivated || [])
      ];

      if (!pages.length) {
        console.warn("No Pancake pages found to refresh tokens for.");
        return;
      }

      let larkClient = null;
      let parentMessageId = null;

      const patsConfig = {};
      for (const page of pages) {
        try {
          const pat = await this.pancakeClient.generateNewPageAccessToken(page.id);
          if (pat) {
            patsConfig[page.id] = pat;
          }
        } catch (err) {
          console.warn(`Failed to generate PAT for page ${page.id}:`, err);
          Sentry.captureException(err);

          try {
            const message = `Không thể tạo mới PAT cho page: ${page.name || "Không rõ"} (${page.id}). Vui lòng kiểm tra lại kết nối với page này trên Pancake!\nChi tiết lỗi: ${err.message}`;
            if (!larkClient) {
              larkClient = await LarksuiteService.createClientV2(this.env);
            }
            parentMessageId = await this.notifyLark(larkClient, parentMessageId, message);
          } catch (larkErr) {
            console.warn(`Failed to send Lark notification for page ${page.id}:`, larkErr);
          }
        }
      }

      if (Object.keys(patsConfig).length === 0) {
        console.warn("Failed to generate any new PATs, aborting sync to Infisical.");
        return;
      }

      const infisicalApiUrl = this.env.INFISICAL_API_URL || "https://infisical.jemmia.vn";
      const accessToken = this.env.INFISICAL_TOKEN;
      const projectId = this.env.INFISICAL_PROJECT_ID;
      const environment = this.env.INFISICAL_ENVIRONMENT || "prod";

      if (!accessToken || !projectId) {
        throw new Error("Missing required Infisical environment variables (INFISICAL_TOKEN, INFISICAL_PROJECT_ID).");
      }

      const entries = Object.entries(patsConfig);
      console.warn(`Generated ${entries.length} new PATs. Syncing to Infisical...`);

      const CHUNK_SIZE = 20;
      let chunkIndex = 1;

      for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
        const chunk = Object.fromEntries(entries.slice(i, i + CHUNK_SIZE));
        const secretName = `PANCAKE_PATS_CONFIG_${chunkIndex}`;
        const secretValue = JSON.stringify(chunk);

        const body = JSON.stringify({
          workspaceId: projectId,
          environment: environment,
          secretPath: "/commons",
          secretValue: secretValue
        });

        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        };

        let res = await fetch(`${infisicalApiUrl}/api/v3/secrets/raw/${secretName}`, {
          method: "PATCH",
          headers,
          body
        });

        if (res.status === 404 || res.status === 400) {
          res = await fetch(`${infisicalApiUrl}/api/v3/secrets/raw/${secretName}`, {
            method: "POST",
            headers,
            body
          });
        }

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to upsert secret ${secretName} in Infisical: ${res.status} - ${errorText}`);
        }

        console.warn(`Successfully updated ${secretName} in Infisical.`);
        chunkIndex++;
      }
    } catch (error) {
      console.warn("Error running Pancake Token Refresher:", error);
      Sentry.captureException(error);
    }
  }

  async notifyLark(larkClient, parentMessageId, message) {
    if (!parentMessageId) {
      const res = await larkClient.im.message.create({
        params: {
          receive_id_type: "chat_id"
        },
        data: {
          receive_id: CHAT_GROUPS.SALESAYA.chat_id,
          msg_type: "text",
          content: JSON.stringify({
            text: `Các lỗi phát sinh ngày ${dayjs().tz(TIMEZONE_VIETNAM).format("DD/MM/YYYY")}`
          })
        }
      });
      parentMessageId = res?.data?.message_id;
    }

    if (parentMessageId) {
      await larkClient.im.message.reply({
        path: {
          message_id: parentMessageId
        },
        data: {
          receive_id: CHAT_GROUPS.SALESAYA.chat_id,
          msg_type: "text",
          reply_in_thread: true,
          content: JSON.stringify({
            text: message
          })
        }
      });
    } else {
      await larkClient.im.message.create({
        params: {
          receive_id_type: "chat_id"
        },
        data: {
          receive_id: CHAT_GROUPS.SALESAYA.chat_id,
          msg_type: "text",
          content: JSON.stringify({
            text: message
          })
        }
      });
    }

    return parentMessageId;
  }
}
