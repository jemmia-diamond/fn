export function isInteger(id) {
  return Number.isInteger(Number(id));
}

export function parseNumber(value, defaultValue) {
  const num = parseInt(value, 10);
  return Number.isFinite(num) ? num : defaultValue;
};
