export function stringSquish(str) {
  return str.trim().replace(/(\s)\s+/g, "$1");
}

export function stringSquishLarkMessage(str) {
  return str
    .trim()
    .replace(/<br\s*\/?>/gi, "\n\n")
    .replace(/\\n/g, "\n")
    .split("\n")
    .map(line => line.trim().replace(/[ \t]+/g, " "))
    .join("\n");
}
