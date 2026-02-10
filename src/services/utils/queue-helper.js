
export default class QueueHelper {
  /**
   * Re-queues a message with a delay.
   * @param {Object} body - The message body.
   * @param {Object} env - The environment object containing queue bindings.
   * @param {string} queueName - The name of the queue binding in env.
   * @param {Object} options - Retry options.
   * @param {number} options.maxRetries - Maximum number of retries (default: 5).
   * @param {number} options.delaySeconds - Delay in seconds before retry (default: 600 seconds ~ 10 minutes).
   * @returns {Promise<void>}
   */
  static async requeueWithDelay(body, env, queueName, { delaySeconds = 600, maxRetries = 5 } = {}) {
    const retryCount = body.retryCount || 0;

    if (retryCount >= maxRetries) {
      console.warn(`[QueueHelper] Max retries (${maxRetries}) reached for message in queue ${queueName}. Dropping message.`, body);
      return;
    }

    const payload = { ...body, retryCount: retryCount + 1 };

    console.warn(`[QueueHelper] Re-queueing message to ${queueName} (Attempt ${payload.retryCount}/${maxRetries}) in ${delaySeconds}s`);

    if (!env[queueName]) {
      throw new Error(`Queue binding '${queueName}' not found in environment`);
    }
    await env[queueName].send(payload, { delaySeconds });
  }
}
