import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import ShieldMessageService from "services/jemmia-shield/shield-message-service";

export default class ShieldEventService {
  static processedEvents = new Set<string>();

  static async processEvent(env: any, body: any, executionCtx: any) {
    let eventBody = body;

    if (body.encrypt) {
      const decryptedData = await JemmiaShieldLarkService.decryptEvent(
        env,
        body.encrypt
      );
      eventBody = JSON.parse(decryptedData);
    }

    if (eventBody.type === "url_verification") {
      return { type: "json", content: { challenge: eventBody.challenge } };
    }

    if (eventBody.header?.event_type === "im.message.receive_v1") {
      const eventId = eventBody.header.event_id;
      if (eventId && this.processedEvents.has(eventId)) {
        return { type: "text", content: "OK", status: 200 };
      }

      if (eventId) {
        this.processedEvents.add(eventId);
        setTimeout(
          () => {
            this.processedEvents.delete(eventId);
          },
          5 * 60 * 1000
        );
      }

      executionCtx.waitUntil(
        (async () => {
          await ShieldMessageService.detectSensitiveInfoAndMask(
            env,
            eventBody.event
          );
        })()
      );
    }

    return { type: "text", content: "OK", status: 200 };
  }
}
