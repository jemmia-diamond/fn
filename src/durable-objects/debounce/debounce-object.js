import { DurableObject } from "cloudflare:workers";
import { DebounceActions } from "src/durable-objects/debounce/debounce-action";

export class DebounceDurableObject extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.latestData = new Map();
    this.defaultDelay = 3000;
    this.actions = {
      [DebounceActions.SEND_TO_MESSAGE_SUMMARY_QUEUE]: async (data) => {
        await this.env["MESSAGE_SUMMARY_QUEUE"].send(data);
      }
    };
  }

  async debounce({ key, data, delay, actionType }) {
    this.latestData.set(key, { data, actionType });

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
        const { data, actionType } = messageInfo;

        const action = this.actions[actionType];
        if (!action) {
          throw new Error(`Unknown action type: ${actionType}`);
        }

        await action(data);
        this.cleanup(key);
      } catch (error) {
        console.error(`Failed to execute debounced callback for key=${key}:`, error);
        this.cleanup(key);
      }
    }
  }

  cleanup(key) {
    this.latestData.delete(key);
  }
}
