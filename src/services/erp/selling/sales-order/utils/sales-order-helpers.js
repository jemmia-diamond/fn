import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

/**
 * Formats time range for display
 * @param {number} minutesBack - Minutes back from current time
 * @param {string} lastDate - Last sync date
 * @returns {string} Human readable time range
 */
export const formatTimeRange = (minutesBack, lastDate = null) => {
  if (lastDate) {
    return `from last sync at ${lastDate}`;
  } else if (minutesBack < 60) {
    return `${minutesBack} minutes`;
  } else if (minutesBack < 1440) {
    const hours = Math.round(minutesBack / 60 * 10) / 10;
    return `${hours} hours`;
  } else {
    const days = Math.round(minutesBack / 1440 * 10) / 10;
    return `${days} days`;
  }
};

/**
 * Calculates date range for sync
 * @param {number} minutesBack - Minutes back from current time
 * @param {string} lastDate - Last sync date
 * @returns {Object} Object containing fromDate and toDate
 */
export const calculateDateRange = (minutesBack, lastDate = null) => {
  const toDate = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
  
  let fromDate;
  if (lastDate) {
    fromDate = dayjs.utc(lastDate).subtract(1, "minute").format("YYYY-MM-DD HH:mm:ss");
  } else {
    fromDate = dayjs().utc().subtract(minutesBack, "minutes").format("YYYY-MM-DD HH:mm:ss");
  }
  
  return { fromDate, toDate };
};

/**
 * Creates a standardized response object for sync operations
 * @param {Object} options - Response options
 * @returns {Object} Standardized response object
 */
export const createSyncResponse = ({
  success = true,
  total = 0,
  synced = 0,
  errors = 0,
  timeRange = "",
  minutesBack = 0,
  syncType = "manual",
  message = "",
  error = null
}) => {
  const response = {
    success,
    total,
    synced,
    errors,
    timeRange,
    minutesBack,
    syncType,
    message
  };

  if (error) {
    response.error = error;
  }

  return response;
};

/**
 * Logs sync progress with consistent formatting
 * @param {string} level - Log level (info, error, success)
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
export const logSyncProgress = (level, message, data = null) => {
  const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const levelIcons = {
    info: "ℹ️",
    error: "❌",
    success: "✅",
    warning: "⚠️"
  };
  
  const icon = levelIcons[level] || "📝";
  let logMessage = `[${timestamp}] ${icon} ${message}`;
  
  if (data) {
    logMessage += ` ${JSON.stringify(data, null, 2)}`;
  }
  
  // Use appropriate console method for each level
  switch (level) {
  case "error":
    console.error(logMessage);
    break;
  case "warning":
    console.warn(logMessage);
    break;
  case "success":
  case "info":
  default:
    // eslint-disable-next-line no-console
    console.log(logMessage);
    break;
  }
};

/**
 * Batches array items for processing
 * @param {Array} items - Items to batch
 * @param {number} batchSize - Size of each batch
 * @returns {Array} Array of batches
 */
export const batchItems = (items, batchSize = 100) => {
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
};

