import axios from "axios";
import * as crypto from "crypto";

export default class RecallLarkService {
  static API_BASE = "https://open.larksuite.com/open-apis";

  static async getAppAccessToken(env: any): Promise<string> {
    try {
      const LARK_APP_ID = env.LARK_APP_ID;
      let LARK_APP_SECRET = env.LARK_APP_SECRET;
      if (typeof LARK_APP_SECRET !== "string") {
        LARK_APP_SECRET = await LARK_APP_SECRET.get();
      }

      const response = await axios.post(
        `${this.API_BASE}/auth/v3/app_access_token/internal`,
        {
          app_id: LARK_APP_ID,
          app_secret: LARK_APP_SECRET
        }
      );

      if (!response.data.app_access_token) {
        throw new Error(
          `Failed to get app token: ${JSON.stringify(response.data)}`
        );
      }

      return response.data.app_access_token;
    } catch (error: any) {
      console.warn("Lark Service Error (getAppAccessToken):", error.message);
      throw error;
    }
  }

  static async client(env: any) {
    const appAccessToken = await this.getAppAccessToken(env);
    return axios.create({
      baseURL: this.API_BASE,
      headers: {
        Authorization: `Bearer ${appAccessToken}`
      }
    });
  }

  static userClient(userAccessToken: string) {
    return axios.create({
      baseURL: this.API_BASE,
      headers: {
        Authorization: `Bearer ${userAccessToken}`
      }
    });
  }

  static async getUserAccessToken(env: any, code: string): Promise<any> {
    try {
      const client = await this.client(env);
      const response = await client.post("/authen/v1/oidc/access_token", {
        grant_type: "authorization_code",
        code: code
      });

      if (response.data.code !== 0) {
        throw new Error(`Lark OAuth Error: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error: any) {
      console.warn("Lark Service Error (getUserAccessToken):", error.message);
      throw error;
    }
  }

  static async getUserGroups(
    env: any,
    userAccessToken: string
  ): Promise<any[]> {
    try {
      let allGroups: any[] = [];
      let pageToken = "";
      let hasMore = true;

      while (hasMore) {
        const response: any = await this.userClient(userAccessToken).get(
          "/im/v1/chats",
          {
            params: {
              page_token: pageToken,
              page_size: 100
            }
          }
        );

        if (response.data.code !== 0) {
          throw new Error(`Failed to fetch user groups: ${response.data.msg}`);
        }

        if (response.data.data?.items) {
          allGroups = allGroups.concat(response.data.data.items);
        }

        hasMore = response.data.data?.has_more;
        pageToken = response.data.data?.page_token;
      }

      return allGroups;
    } catch (error: any) {
      console.warn("Lark Service Error (getUserGroups):", error.message);
      throw error;
    }
  }

  static async addBotAsManager(
    env: any,
    chatId: string,
    userAccessToken: string
  ): Promise<void> {
    try {
      const LARK_APP_ID = env.LARK_APP_ID;
      const response = await this.userClient(userAccessToken).post(
        `/im/v1/chats/${chatId}/managers/add_managers`,
        {
          manager_ids: [LARK_APP_ID]
        },
        {
          params: {
            member_id_type: "app_id"
          }
        }
      );

      if (response.data.code !== 0) {
        throw new Error(
          `Failed to add bot as manager to group ${chatId}: ${response.data.msg}`
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.warn(
          `Lark API Error Data for chat ${chatId}:`,
          JSON.stringify(error.response.data, null, 2)
        );
      }
      console.warn(
        `Lark Service Error (addBotAsManager) for chat ${chatId}:`,
        error.message
      );
      throw error;
    }
  }

  static async getUserInfo(env: any, userAccessToken: string): Promise<any> {
    try {
      const response = await this.userClient(userAccessToken).get(
        "/authen/v1/user_info"
      );

      if (response.data.code !== 0) {
        throw new Error(`Failed to get user info: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error: any) {
      console.warn(error);
      console.warn("Lark Service Error (getUserInfo):", error.message);
      throw error;
    }
  }

  static async addBotToGroup(
    env: any,
    chatId: string,
    userAccessToken: string
  ): Promise<void> {
    try {
      const LARK_APP_ID = env.LARK_APP_ID;
      const response = await this.userClient(userAccessToken).post(
        `/im/v1/chats/${chatId}/members`,
        {
          id_list: [LARK_APP_ID]
        },
        {
          params: {
            member_id_type: "app_id"
          }
        }
      );

      if (response.data.code !== 0) {
        // Ignore if already in group (code might vary, but for now log and throw to be handled)
        throw new Error(
          `Failed to add bot to group ${chatId}: ${response.data.msg}`
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.warn(
          `Lark API Error Data (addBotToGroup) for chat ${chatId}:`,
          JSON.stringify(error.response.data, null, 2)
        );
      }
      console.warn(
        `Lark Service Error (addBotToGroup) for chat ${chatId}:`,
        error.message
      );
      throw error;
    }
  }

  static async getAuthUrl(
    env: any,
    state: string = "random_state"
  ): Promise<string> {
    const LARK_APP_ID = env.LARK_APP_ID;
    const LARK_REDIRECT_URI = env.LARK_REDIRECT_URI;
    const LARK_RECALL_REDIRECT_URI = env.LARK_RECALL_REDIRECT_URI;

    const scope =
      "contact:user.id:readonly im:chat im:chat.managers:write_only im:chat.members:write_only";
    // Assuming LARK_REDIRECT_URI is in env or constructed
    const redirectUri = LARK_RECALL_REDIRECT_URI || LARK_REDIRECT_URI;
    return `${this.API_BASE}/authen/v1/authorize?app_id=${LARK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  }

  static async decryptEvent(env: any, encrypted: string): Promise<string> {
    const encryptKey = env.LARK_ENCRYPT_KEY;
    if (!encryptKey) {
      throw new Error("LARK_ENCRYPT_KEY is not set");
    }

    const key = crypto.createHash("sha256").update(encryptKey).digest();
    const iv = Buffer.from(encrypted, "base64").subarray(0, 16);
    const encryptedData = Buffer.from(encrypted, "base64").subarray(16);

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  }

  static async getImage(
    env: any,
    messageId: string,
    imageKey: string
  ): Promise<Buffer> {
    try {
      const client = await this.client(env);
      const response = await client.get(
        `/im/v1/messages/${messageId}/resources/${imageKey}`,
        {
          params: {
            type: "image"
          },
          responseType: "arraybuffer"
        }
      );

      return Buffer.from(response.data);
    } catch (error: any) {
      console.warn("Lark Service Error (getImage):", error.message);
      throw error;
    }
  }

  static async sendMessage(
    env: any,
    receiveId: string,
    receiveIdType: string,
    msgType: string,
    content: string
  ): Promise<void> {
    try {
      const client = await this.client(env);
      const response = await client.post(
        "/im/v1/messages",
        {
          receive_id: receiveId,
          msg_type: msgType,
          content: content
        },
        {
          params: {
            receive_id_type: receiveIdType
          }
        }
      );

      if (response.data.code !== 0) {
        throw new Error(`Failed to send message: ${response.data.msg}`);
      }
    } catch (error: any) {
      console.warn("Lark Service Error (sendMessage):", error.message);
      throw error;
    }
  }

  static async replyMessage(
    env: any,
    messageId: string,
    content: string,
    msgType: string
  ): Promise<void> {
    try {
      const client = await this.client(env);
      const response = await client.post(`/im/v1/messages/${messageId}/reply`, {
        content: content,
        msg_type: msgType
      });

      if (response.data.code !== 0) {
        throw new Error(`Failed to reply message: ${response.data.msg}`);
      }
    } catch (error: any) {
      console.warn("Lark Service Error (replyMessage):", error.message);
      throw error;
    }
  }

  static async sendMessageToThread(
    env: any,
    messageId: string,
    msgType: string,
    content: string
  ): Promise<void> {
    try {
      const client = await this.client(env);
      const response = await client.post(`/im/v1/messages/${messageId}/reply`, {
        content: content,
        msg_type: msgType,
        reply_in_thread: true
      });

      if (response.data.code !== 0) {
        throw new Error(
          `Failed to send message to thread: ${response.data.msg}`
        );
      }
    } catch (error: any) {
      console.warn("Lark Service Error (sendMessageToThread):", error.message);
      throw error;
    }
  }

  static async recallMessage(env: any, messageId: string): Promise<void> {
    try {
      const client = await this.client(env);
      const response = await client.delete(`/im/v1/messages/${messageId}`);

      if (response.data.code !== 0) {
        throw new Error(`Failed to recall message: ${response.data.msg}`);
      }
    } catch (error: any) {
      console.warn("Lark Service Error (recallMessage):", error.message);
    }
  }

  static async getMessage(env: any, messageId: string): Promise<any> {
    try {
      const client = await this.client(env);
      const response = await client.get(`/im/v1/messages/${messageId}`);

      if (response.data.code !== 0) {
        throw new Error(`Failed to get message: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error: any) {
      console.warn("Lark Service Error (getMessage):", error.message);
      throw error;
    }
  }

  static async uploadImage(env: any, imageBuffer: Buffer): Promise<string> {
    try {
      const appAccessToken = await this.getAppAccessToken(env);
      const formData = new FormData();
      const blob = new Blob([imageBuffer]);
      formData.append("image", blob, "image.jpg");
      formData.append("image_type", "message");

      // Use native fetch to avoid axios multipart issues
      const response = await fetch(`${this.API_BASE}/im/v1/images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${appAccessToken}`
          // Content-Type is intentionally omitted to let fetch set the boundary
        },
        body: formData
      });

      const responseData: any = await response.json();

      if (responseData.code !== 0) {
        throw new Error(`Failed to upload image: ${responseData.msg}`);
      }

      return responseData.data.image_key;
    } catch (error: any) {
      console.warn("Lark Service Error (uploadImage):", error.message);
      throw error;
    }
  }
}
