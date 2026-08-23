export function reverseMap(map) {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [value, Number(key)])
  );
}
