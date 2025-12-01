export function toUnixTimestamp(dateObj) {
  if (!dateObj) return null;
  return new Date(dateObj).getTime();
}
