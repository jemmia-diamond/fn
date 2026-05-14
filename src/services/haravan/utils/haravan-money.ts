export function haravanMoneyToNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = parseFloat(String(value).trim());
  return Number.isFinite(n) ? n : 0;
}
