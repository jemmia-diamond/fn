export function stringSquish(str) {
  return str.trim().replace(/(\s)\s+/g, "$1");
}

export function stringSquishLarkMessage(str) {
  return str
    .trim()
    .replace(/<br\s*\/?br\s*\/?>/gi, "\n\n")
    .split("\n")
    .map(line => line.trim().replace(/[ \t]+/g, " "))
    .join("\n");
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
