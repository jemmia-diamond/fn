export const retryQuery = async (queryFn, retries = 3, delay = 1000) => {
  try {
    return await queryFn();
  } catch (error) {
    // Retry on error code 58000 (Internal Error) or timeout/handshake issues
    const shouldRetry = retries > 0 && (
      error?.code === "58000" ||
      error?.message?.includes("58000") ||
      error?.message?.toLowerCase().includes("timeout") ||
      error?.message?.toLowerCase().includes("handshake") ||
      error?.message?.toLowerCase().includes("connect")
    );

    if (shouldRetry) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryQuery(queryFn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const retry = async (operation, retries = 3, delay = 1500) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay));
    }
  }
};
