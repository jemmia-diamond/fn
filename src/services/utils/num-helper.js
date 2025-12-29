export function isInteger(id) {
  return Number.isInteger(Number(id));
}

export function parseNumber(value, defaultValue, asFloat = false) {
  const num = asFloat ? parseFloat(value) : parseInt(value, 10);
  return Number.isFinite(num) ? num : defaultValue;
};
