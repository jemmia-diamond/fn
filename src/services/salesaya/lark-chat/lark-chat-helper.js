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
