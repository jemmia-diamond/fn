/**
 * Utility functions for retry operations with exponential backoff
 */

/**
 * Logs retry progress messages
 * @param {string} level - Log level (info, warning, error, success)
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
const logRetryProgress = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logData = data.error ? { ...data, error: data.error.message || data.error } : data;
  
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, logData);
};

/**
 * Retries an async operation with exponential backoff
 * @param {Function} operation - Async operation to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {Function} options.onRetry - Callback function called before each retry
 * @param {boolean} options.logProgress - Whether to log retry progress (default: true)
 * @returns {Promise} Result of the operation
 */
export const retryWithBackoff = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    onRetry = null,
    logProgress = true
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        if (logProgress) {
          logRetryProgress("error", `Final attempt ${attempt} failed`, { error });
        }
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      
      if (logProgress) {
        logRetryProgress("warning", `Attempt ${attempt} failed, retrying in ${delay}ms`, { error: error.message });
      }
      
      if (onRetry) {
        onRetry(attempt, error, delay);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Retries an async operation with custom retry condition
 * @param {Function} operation - Async operation to retry
 * @param {Function} shouldRetry - Function that determines if retry should happen
 * @param {Object} options - Retry options
 * @returns {Promise} Result of the operation
 */
export const retryWithCondition = async (operation, shouldRetry, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    onRetry = null,
    logProgress = true
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries || !shouldRetry(error, attempt)) {
        if (logProgress) {
          logRetryProgress("error", `Final attempt ${attempt} failed`, { error });
        }
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      
      if (logProgress) {
        logRetryProgress("warning", `Attempt ${attempt} failed, retrying in ${delay}ms`, { error: error.message });
      }
      
      if (onRetry) {
        onRetry(attempt, error, delay);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Retries an async operation with linear backoff
 * @param {Function} operation - Async operation to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of the operation
 */
export const retryWithLinearBackoff = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    delay = 1000,
    onRetry = null,
    logProgress = true
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        if (logProgress) {
          logRetryProgress("error", `Final attempt ${attempt} failed`, { error });
        }
        throw error;
      }
      
      if (logProgress) {
        logRetryProgress("warning", `Attempt ${attempt} failed, retrying in ${delay}ms`, { error: error.message });
      }
      
      if (onRetry) {
        onRetry(attempt, error, delay);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}; 
