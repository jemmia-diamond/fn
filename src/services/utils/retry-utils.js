export const retryQuery = async (queryFn, retries = 3, delay = 1000) => {
  try {
    return await queryFn();
  } catch (error) {
    // Retry on error code 58000 (Internal Error) or timeout/handshake issues
    const errorMessage = error?.message?.toLowerCase() || "";
    const statusCode = error?.status || error?.response?.status;
    const shouldRetry = retries > 0 && (
      error?.code === "58000" ||
      errorMessage.includes("58000") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("handshake") ||
      errorMessage.includes("connect") ||
      errorMessage.includes("bad gateway") ||
      errorMessage.includes("502") ||
      errorMessage.includes("503") ||
      errorMessage.includes("invalid array buffer length") ||
      statusCode === 400 ||
      statusCode === 429 ||
      statusCode === 500 ||
      statusCode === 502 ||
      statusCode === 503
    );

    if (shouldRetry) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryQuery(queryFn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const retryRequest = async (requestFn, retries = 3, delay = 1000) => {
  return retryQuery(requestFn, retries, delay);
};
