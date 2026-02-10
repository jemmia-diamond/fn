import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import JemmiaShieldMessageService from "services/jemmia-shield/jemmia-shield-message-service";

export default class JemmiaShieldEventController {
  // Using a simple in-memory set for deduplication (might be reset if worker restarts frequently)
  // For better durability in workers, Durable Objects or KV should be used, but keeping it simple for now as per original code.
  static processedEvents = new Set<string>();

  static register(webhook: any) {
    webhook.post("/jemmia-shield/event", JemmiaShieldEventController.create);
  }

  static async create(c: any) {
    try {
      const body = await c.req.json();
      let eventBody = body;

      // 1. Decrypt if encrypted
      if (body.encrypt) {
        const decryptedData = await JemmiaShieldLarkService.decryptEvent(
          c.env,
          body.encrypt
        );
        eventBody = JSON.parse(decryptedData);
      }

      // 2. Handle URL Verification
      if (eventBody.type === "url_verification") {
        return c.json({ challenge: eventBody.challenge });
      }

      // 4. Handle Message Event
      if (eventBody.header?.event_type === "im.message.receive_v1") {
        const eventId = eventBody.header.event_id;
        if (
          eventId &&
          JemmiaShieldEventController.processedEvents.has(eventId)
        ) {
          console.warn(`Skipping duplicate event: ${eventId}`);
          return c.text("OK", 200);
        }

        if (eventId) {
          JemmiaShieldEventController.processedEvents.add(eventId);
          // Auto-cleanup after 5 minutes
          setTimeout(
            () => {
              JemmiaShieldEventController.processedEvents.delete(eventId);
            },
            5 * 60 * 1000
          );
        }

        // Process in background using waitUntil to prevent blocking the response
        // and to keep the worker alive while processing
        c.executionCtx.waitUntil(
          (async () => {
            try {
              await JemmiaShieldMessageService.detectSensitiveInfoAndMask(
                c.env,
                eventBody.event
              );
            } catch (err) {
              console.warn("Error processing message event:", err);
            }
          })()
        );
      }

      return c.text("OK", 200);
    } catch (error: any) {
      console.warn("Lark Event Error:", error.message);
      return c.text("Internal Server Error", 500);
    }
  }
}
