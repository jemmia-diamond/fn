import ShieldEventService from "services/jemmia-shield/shield-event-service";

export default class ShieldEventController {
  static register(webhook: any) {
    webhook.post("/jemmia-shield/event", ShieldEventController.create);
  }

  static async create(c: any) {
    const body = await c.req.json();
    const result = await ShieldEventService.processEvent(
      c.env,
      body,
      c.executionCtx
    );

    if (result.type === "json") {
      return c.json(result.content);
    } else {
      return c.text(result.content, result.status);
    }
  }
}
