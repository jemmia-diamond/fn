import JemmiaShieldEventService from "services/jemmia-shield/shield-event-service";

export default class JemmiaShieldEventController {
  static register(webhook: any) {
    webhook.post("/jemmia-shield/event", JemmiaShieldEventController.create);
  }

  static async create(c: any) {
    const body = await c.req.json();
    const result = await JemmiaShieldEventService.processEvent(
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
