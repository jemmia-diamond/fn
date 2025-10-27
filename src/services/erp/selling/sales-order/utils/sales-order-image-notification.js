const LARK_IMAGE_UPLOAD_URL = "https://open.larksuite.com/open-apis/image/v4/put/";
const LARK_MESSAGE_SEND_URL = "https://open.larksuite.com/open-apis/message/v4/send/";
const LARK_MESSAGE_REPLY_URL = (messageId) => `https://open.larksuite.com/open-apis/im/v1/messages/${messageId}/reply`;

async function getTenantAccessToken({ larkClient, env }) {
  const res = await larkClient.auth.tenantAccessToken.internal({
    data: {
      app_id: env.LARKSUITE_APP_ID,
      app_secret: await env.LARK_APP_SECRET_SECRET.get()
    }
  });
  return res.tenant_access_token;
}

/**
 * Downloads an image from a URL and saves it locally.
 */
async function downloadImageAsBuffer({ imageUrl }) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return buffer;
  } catch (err) {
    console.error("❌ Failed to download image:", err.message);
    return null;
  }
}

/**
 * Uploads an image file to Lark and returns the image_key.
 */
async function uploadLarkImage({ larkClient, imageBuffer, env }) {
  const tenantAccessToken = await getTenantAccessToken({ larkClient, env });
  if (!tenantAccessToken) {
    console.error("❌ Could not obtain tenant access token for upload.");
    return null;
  }

  const form = new FormData();
  form.append("image_type", "message");
  const imageBlob = new Blob([imageBuffer], { type: "image/jpeg" });
  form.append("image", imageBlob, "image.jpg");

  try {
    const response = await fetch(LARK_IMAGE_UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tenantAccessToken}`
      },
      body: form
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Upload request failed:", response.status, response.statusText);
      console.error("Lark API Response Data:", data);
      return null;
    }

    if (data.code === 0) {
      return data.data.image_key;
    } else {
      console.error(`❌ Lark API error: ${data.msg}`);
      if (data.error) {
        console.error("Lark Error Details:", data.error);
      }
      return null;
    }
  } catch (err) {
    console.error("❌ Upload request failed:", err.message);
    if (err.response) {
      console.error("Lark API Response Data:", err.response.data);
    }
    return null;
  }
}

/**
 * Sends an image message to a Lark chat.
 */
async function sendLarkImageMessage({ larkClient, chatId, imageKey, rootMessageId, env, isReply }) {
  const tenantAccessToken = await getTenantAccessToken({ larkClient, env });
  if (!tenantAccessToken) {
    console.error("❌ Could not obtain tenant access token for sending message.");
    return;
  }

  let url;
  let payload;

  if (isReply && rootMessageId) {
    url = LARK_MESSAGE_REPLY_URL(rootMessageId);
    payload = {
      msg_type: "image",
      content: JSON.stringify({ image_key: imageKey }),
      reply_in_thread: true
    };
  } else {
    url = LARK_MESSAGE_SEND_URL;
    payload = {
      chat_id: chatId,
      msg_type: "image",
      content: { image_key: imageKey }
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tenantAccessToken}`,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Sending/replying request failed:", response.status, response.statusText);
      console.error("Lark API Response Data:", data);
      return;
    }
  } catch (err) {
    console.error("❌ Sending/replying request failed:", err.message);
  }
}

/**
 * Combined function to download → upload → send image to Lark chat.
 */
export async function sendLarkImageFromUrl({ larkClient, imageUrl, chatId, rootMessageId, env, isReply = true }) {
  try {
    const imageBuffer = await downloadImageAsBuffer({ imageUrl });

    if (!imageBuffer) return false;

    const imageKey = await uploadLarkImage({ larkClient, imageBuffer, env });
    if (!imageKey) return false;

    await sendLarkImageMessage({
      larkClient, chatId, imageKey, rootMessageId, env, isReply
    });
    return true;
  }  catch (e) {
    console.error(`sendLarkImageFromUrl ${e}`);
    return false;
  }
}
