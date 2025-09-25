export class DebounceDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
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
    this.latestData.set(key, { data, queueName });

    const existingAlarm = await this.state.storage.getAlarm();
    if (existingAlarm) {
      await this.state.storage.deleteAlarm();
    }

    const alarmTime = Date.now() + delay;
    await this.state.storage.setAlarm(alarmTime);
  }

  async alarm() {
    const keysToProcess = Array.from(this.latestData.keys());

    for (const key of keysToProcess) {
      const messageInfo = this.latestData.get(key);
      if (!messageInfo) continue;

      try {
        const { data, queueName } = messageInfo;
        await this.env[queueName].send(data);
        this.cleanup(key);
      } catch (error) {
        console.error(`Failed to send debounced data for key=${key}:`, error);
        this.cleanup(key);
      }
    }
  }

  cleanup(key) {
    this.latestData.delete(key);
  }
}
