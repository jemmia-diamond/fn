export function stringSquish(str) {
  return str.trim().replace(/(\s)\s+/g, "$1");
}
