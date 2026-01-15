
function pemToArrayBuffer(pem) {
  const b64Lines = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const b64 = atob(b64Lines);
  const buf = new ArrayBuffer(b64.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < b64.length; i++) {
    view[i] = b64.charCodeAt(i);
  }
  return buf;
}

function arrayBufferToBase64Url(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function objectToBase64Url(obj) {
  return arrayBufferToBase64Url(new TextEncoder().encode(JSON.stringify(obj)));
}

export default class GoogleAuth {
  constructor(credentials) {
    this.credentials = credentials;
    this.tokenUrl = "https://oauth2.googleapis.com/token";
    this.scopes = ["https://www.googleapis.com/auth/content"];
  }

  async getAccessToken() {
    const header = {
      alg: "RS256",
      typ: "JWT"
    };

    const now = Math.floor(Date.now() / 1000);
    const claimSet = {
      iss: this.credentials.client_email,
      scope: this.scopes.join(" "),
      aud: this.tokenUrl,
      exp: now + 3600,
      iat: now
    };

    const encodedHeader = objectToBase64Url(header);
    const encodedClaimSet = objectToBase64Url(claimSet);
    const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

    const keyData = pemToArrayBuffer(this.credentials.private_key);

    // Import private key
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      keyData,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    );

    // Sign
    const signatureBuffer = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      privateKey,
      new TextEncoder().encode(signatureInput)
    );

    const encodedSignature = arrayBufferToBase64Url(signatureBuffer);
    const jwt = `${signatureInput}.${encodedSignature}`;

    // Exchange for access token
    const params = new URLSearchParams();
    params.append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
    params.append("assertion", jwt);

    const response = await fetch(this.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch access token: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  }
}
