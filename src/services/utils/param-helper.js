export function splitParams(param, limit = 1000) {
  if (!param) return [];
  return param
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v !== "")
    .slice(0, limit);
}
