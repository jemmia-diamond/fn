import * as Sentry from "@sentry/cloudflare";
import { DurableObject } from "cloudflare:workers";
import { DebounceActions } from "src/durable-objects/debounce/debounce-action";

export class DebounceDurableObject extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.state = state;
    this.env = env;
    this.defaultDelay = 3000;
    this.actions = {
      [DebounceActions.SEND_TO_MESSAGE_SUMMARY_QUEUE]: async (data) => {
        await this.env["MESSAGE_SUMMARY_QUEUE"].send(data);
      },
      [DebounceActions.SEND_TO_MESSAGE_LAST_CUSTOMER_QUEUE]: async (data) => {
        await this.env["MESSAGE_LAST_CUSTOMER_QUEUE"].send(data);
      },
      [DebounceActions.SEND_TO_PANCAKE_EXTRA_HOOKS_QUEUE]: async (data) => {
        await this.env["PANCAKE_EXTRA_HOOKS_QUEUE"].send(data);
      },
      [DebounceActions.SEND_TO_HARAVAN_PRODUCT_QUEUE]: async (data) => {
        await this.env["HARAVAN_PRODUCT_QUEUE"].send(data);
      },
      [DebounceActions.SEND_TO_ERPNEXT_SALES_ORDER_QUEUE]: async (data) => {
        await this.env["ERPNEXT_SALES_ORDER_QUEUE"].send(data);
      }
    };
  }

  async debounce({ key, data, delay, actionType }) {
    await this.state.storage.put(key, { data, actionType });

    const existingAlarm = await this.state.storage.getAlarm();
    if (existingAlarm) {
      await this.state.storage.deleteAlarm();
    }

    const alarmTime = Date.now() + (delay ?? this.defaultDelay);
    await this.state.storage.setAlarm(alarmTime);
  }

  async alarm() {
    try {
      const storedTasks = await this.state.storage.list({ limit: 50 });
      const keysToDelete = [];

      for (const [key, storedTask] of storedTasks) {
        try {
          const { data, actionType } = storedTask;

          const action = this.actions[actionType];
          if (!action) {
            throw new Error(`Unknown action type: ${actionType}`);
          }

          await action(data);
          keysToDelete.push(key);
        } catch (error) {
          Sentry.captureException(error);
          keysToDelete.push(key);
        }
      }

      if (keysToDelete.length > 0) {
        await this.state.storage.delete(keysToDelete);
      }

      if (storedTasks.size === 50) {
        await this.state.storage.setAlarm(Date.now() + 100);
      }

    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
