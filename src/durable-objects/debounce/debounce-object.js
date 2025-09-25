export class DebounceDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.timers = new Map();
    this.latestData = new Map();
    this.defaultDelay = 3000;
  }

  async fetch(request) {
    const { key, data, delay, queueName } = await request.json();

    await this.debounce({
      key,
      data,
      delay: delay || this.defaultDelay,
      queueName
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  async debounce({ key, data, delay, queueName }) {
    this.latestData.set(key, data);

    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    const timer = setTimeout(async () => {
      try {
        const latest = this.latestData.get(key);
        if (latest && queueName) {
          await this.env[queueName].send(latest);
        }
      } catch (err) {
        console.error(`Failed to send debounced data to queue ${queueName} for key=${key}:`, err);
      } finally {
        this.cleanup(key);
      }
    }, delay);

    this.timers.set(key, timer);
  }

  cleanup(key) {
    this.timers.delete(key);
    this.latestData.delete(key);
  }
}
