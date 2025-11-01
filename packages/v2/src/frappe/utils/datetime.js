import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";

// Extend dayjs with plugins
dayjs.extend(customParseFormat);
dayjs.extend(utc);

/**
 * @typedef {('date'|'datetime')} FormatType
 */

export function convertIsoToDatetime(isoString, type) {
  /** @type {FormatType} */
  type = type;
  if (!isoString || typeof isoString !== "string") return null;
  // Remove unnecessary spaces
  const cleaned = isoString.replace(/\s+/g, "");
  const date = dayjs(cleaned);
  if (!date.isValid()) {
    console.error("Invalid date:", isoString);
    return null;
  }
  if (type === "date") {
    return date.utc().format("YYYY-MM-DD");
  }
  // Return datetime with microseconds
  const milliseconds = String(date.millisecond()).padStart(3, "0") + "000"; // Simulate microseconds
  return `${date.utc().format("YYYY-MM-DD HH:mm:ss")}.${milliseconds}`;
}
