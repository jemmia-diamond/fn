export const safeValue = (value, type = "string", maxLength = null) => {
  if (value === null || value === undefined || value === "") return null;
  switch (type) {
    case "number":
      if (typeof value === "number") return value;
      if (typeof value === "string" && !isNaN(Number(value)))
        return Number(value);
      return null;
    case "date":
      return new Date(value);
    default:
      if (maxLength && typeof value === "string" && value.length > maxLength) {
        return value.slice(0, maxLength);
      }
      return value;
  }
};
