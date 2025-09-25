import { DurableObject } from "cloudflare:workers";

export class DebounceDurableObject extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.latestData = new Map();
    this.defaultDelay = 3000;
  }

  async debounce({ key, data, delay, queueName }) {
    this.latestData.set(key, { data, queueName });

    const existingAlarm = await this.ctx.storage.getAlarm();
    if (existingAlarm) {
      await this.ctx.storage.deleteAlarm();
    }

    const alarmTime = Date.now() + delay;
    await this.ctx.storage.setAlarm(alarmTime);
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
