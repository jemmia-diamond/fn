export function parseURLParameters(url) {
  try {
    if (url) {
      return new URL(url).searchParams;
    }
    return null;
  } catch {
    return null;
  }
}

export function getParam(raw, key, ...sources) {
  return (
    raw[key] ||
    sources.reduce(
      (acc, params) => acc || params?.get(key),
      null
    )
  );
}
