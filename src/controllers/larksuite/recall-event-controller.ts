import RecallLarkService from "services/larksuite/recall-lark-service";
import RecallMessageService from "services/larksuite/recall-message-service";

export default class RecallEventController {
  // Using a simple in-memory set for deduplication (might be reset if worker restarts frequently)
  // For better durability in workers, Durable Objects or KV should be used, but keeping it simple for now as per original code.
  static processedEvents = new Set<string>();

  static register(webhook: any) {
    webhook.post("/lark/recall/event", RecallEventController.create);
  }

  static async create(c: any) {
    try {
      const body = await c.req.json();
      let eventBody = body;

      // 1. Decrypt if encrypted
      if (body.encrypt) {
        const decryptedData = await RecallLarkService.decryptEvent(
          c.env,
          body.encrypt
        );
        eventBody = JSON.parse(decryptedData);
      }

      // 2. Handle URL Verification
      if (eventBody.type === "url_verification") {
        return c.json({ challenge: eventBody.challenge });
      }

      // 3. Handle Message Event
      if (eventBody.header?.event_type === "im.message.receive_v1") {
        const eventId = eventBody.header.event_id;
        if (eventId && RecallEventController.processedEvents.has(eventId)) {
          console.warn(`Skipping duplicate event: ${eventId}`);
          return c.text("OK", 200);
        }

        if (eventId) {
          RecallEventController.processedEvents.add(eventId);
          // Auto-cleanup after 5 minutes
          setTimeout(
            () => {
              RecallEventController.processedEvents.delete(eventId);
            },
            5 * 60 * 1000
          );
        }

        // Process in background using waitUntil to prevent blocking the response
        // and to keep the worker alive while processing
        c.executionCtx.waitUntil(
          (async () => {
            try {
              await RecallMessageService.detectSensitiveInfoAndMask(
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
