export function mergeObjects(objects) {
  return objects.reduce((acc, obj) => {
    return { ...acc, ...obj };
  }, {});
}

export function removeKeysWithNull(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null)
  );
}
