// import LarksuiteService from "services/larksuite/lark";
// import * as Sentry from "@sentry/cloudflare";

// export class ImageMessagingService {

//   /**
//      * Uploads an image file to Lark and returns the image_key.
//      */
//   static async uploadLarkImage({ larkClient, imageBuffer, env }) {
//     const tenantAccessToken = await LarksuiteService.getTenantAccessTokenFromClient({ larkClient, env });
//     if (!tenantAccessToken) {
//       Sentry.captureException(new Error("Could not obtain tenant access token for upload."));
//       return null;
//     }

//     const form = new FormData();
//     form.append("image_type", "message");
//     const imageBlob = new Blob([imageBuffer], { type: "image/jpeg" });
//     form.append("image", imageBlob, "image.jpg");

//     try {
//       const response = await fetch(`${env.LARK_API_ENDPOINT}/open-apis/image/v4/put/`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${tenantAccessToken}`
//         },
//         body: form
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         Sentry.captureException(new Error(`Upload request failed: ${response.status} ${response.statusText}`));
//         return null;
//       }

//       if (data.code === 0) {
//         return data.data.image_key;
//       } else {
//         Sentry.captureException(new Error(`Lark API error: ${data.msg}`));
//         return null;
//       }
//     } catch (err) {
//       Sentry.captureException(err);
//       return null;
//     }
//   }

//   /**
//      * Sends an image message to a Lark chat.
//      */
//   static async sendLarkImageMessage({ larkClient, chatId, imageKey, rootMessageId, env, isReply }) {
//     const tenantAccessToken = await LarksuiteService.getTenantAccessTokenFromClient({ larkClient, env });
//     if (!tenantAccessToken) {
//       Sentry.captureException(new Error("Could not obtain tenant access token for sending message."));
//       return;
//     }

//     let url;
//     let payload;

//     if (isReply && rootMessageId) {
//       url = `${env.LARK_API_ENDPOINT}/open-apis/im/v1/messages/${rootMessageId}/reply`;
//       payload = {
//         msg_type: "image",
//         content: JSON.stringify({ image_key: imageKey }),
//         reply_in_thread: true
//       };
//     } else {
//       url = `${env.LARK_API_ENDPOINT}/open-apis/message/v4/send/`;
//       payload = {
//         chat_id: chatId,
//         msg_type: "image",
//         content: { image_key: imageKey }
//       };
//     }

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${tenantAccessToken}`,
//           "Content-Type": "application/json; charset=utf-8"
//         },
//         body: JSON.stringify(payload)
//       });
//       const data = await response.json();

//       if (!response.ok) {
//         Sentry.captureException(new Error(`Sending/replying request failed: ${response.status} ${response.statusText}`), { extra: { responseData: data } });
//         return;
//       }
//     } catch (err) {
//       Sentry.captureException(err);
//     }
//   }

//   /**
//      * Combined function to download → upload → send image to Lark chat.
//      */
//   static async sendLarkImageFromUrl({ larkClient, imageBuffer, chatId, rootMessageId, env, isReply = true }) {
//     try {

//       const imageKey = await ImageMessagingService.uploadLarkImage({ larkClient, imageBuffer, env });
//       if (!imageKey) return false;

//       await ImageMessagingService.sendLarkImageMessage({
//         larkClient, chatId, imageKey, rootMessageId, env, isReply
//       });
//       return true;
//     }  catch (e) {
//       Sentry.captureException(e);
//       return false;
//     }
//   }
// }
