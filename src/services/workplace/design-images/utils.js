export const BASE_ID = "pbzopuiobhc8xf1";
export const TABLE_ID = "m9t4aeympg0lokc";
export const COLUMN_ID = "cq2ja2kexb2aayk";
export const VIEW_ID = "vwzvp0ubjulga5vu";
export const R2_TMP_PREFIX = "tmp-design-images";

export function colorMapping(color) {
  const colorMap = {
    "vàng trắng": "VT",
    "vàng hồng": "VH",
    "vàng vàng": "VV",
    "vàng trắng - vàng hồng": "VT-VH",
    "vàng trắng - vàng vàng": "VT-VV",
    "vàng hồng - vàng vàng": "VH-VV"
  };
  return colorMap[color.toLowerCase()] || null;
}

export function extractFolderIdFromLink(link) {
  if (!link) {
    return "";
  }
  let cleaned = link.trim();
  cleaned = cleaned.split("?")[0];
  if (cleaned.includes("drive.google.com")) {
    if (cleaned.includes("/folders/")) {
      cleaned = cleaned.split("/folders/")[1];
    } else if (cleaned.includes("/file/d/")) {
      cleaned = cleaned.split("/file/d/")[1];
    } else {
      cleaned = cleaned.replace(/\/$/, "").split("/").pop();
    }
  } else {
    cleaned = cleaned.replace(/\/$/, "").split("/").pop();
  }
  cleaned = cleaned.split("/")[0];
  cleaned = cleaned.replace(/%0D/g, "").replace(/%0A/g, "").trim().replace(/^\/+|\/+$/g, "");
  return cleaned;
}

export function imageNameNormalizer(designCode, color) {
  function removeVietnameseCharacters(text) {
    const normalized = text.normalize("NFD");
    const stripped = normalized.replace(/\p{Diacritic}/gu, "");
    return stripped.normalize("NFC");
  }

  const normColor = removeVietnameseCharacters(color).replace(/ - /g, "-").replace(/ /g, "-").toLowerCase();
  const designNorm = designCode ? designCode.toLowerCase() : "";
  return {
    imageNameNorm: `${designNorm}--${normColor}--`.toLowerCase(),
    colorNorm: `${normColor}--`.toLowerCase()
  };
}
