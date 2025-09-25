export class DebounceDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.timers = new Map();
    this.latestData = new Map();
    this.defaultDelay = 3000;
    this.sendMap = {
      MESSAGE_SUMMARY_QUEUE: async (data) => await this.env["MESSAGE_SUMMARY_QUEUE"].send(data)
    };
  }

  async fetch(request) {
    const { key, data, delay, sendType } = await request.json();;
    const sendFn = this.sendMap[sendType];
    await this.debounce({
      key,
      data,
      delay: delay || this.defaultDelay,
      sendFn
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  }

  async debounce({ key, data, delay, sendFn }) {
    this.latestData.set(key, data);

    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    const timer = setTimeout(async () => {
      try {
        const latest = this.latestData.get(key);
        if (latest) {
          await sendFn(latest);
        }
      } catch (err) {
        console.error(`Failed to send debounced message for key=${key}:`, err);
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
