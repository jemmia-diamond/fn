export const productCodeRegex = /\b[A-Z]{5}[0-9]{7}\b/g;

export function extractCodes(text) {
  return text.match(productCodeRegex) || [];
}

export function sanitizeFilename(str) {
  return str.replace(/[^\w\d-_.]/g, "_");
}

export function getFilename(code, index, ext) {
  const safe = sanitizeFilename(code);
  return `${safe}_${index}.${ext}`;
}

export function flattenContentText(contentObj) {
  if (typeof contentObj?.text === "string") {
    return contentObj.text;
  }

  if (Array.isArray(contentObj?.content)) {
    const parts = [];
    for (const block of contentObj.content) {
      if (!Array.isArray(block)) continue;

      for (const item of block) {
        if (item.tag === "text" && typeof item.text === "string") {
          parts.push(item.text);
        }
      }
    }
    return parts.join(" ").trim();
  }

  return "";
}
