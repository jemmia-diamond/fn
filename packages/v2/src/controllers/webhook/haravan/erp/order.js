import {
  HARAVAN_DISPATCH_TYPE_ZALO_MSG,
  HARAVAN_TOPIC,
} from "services/ecommerce/enum";

export default class HaravanERPOrderController {
  static async create(ctx) {
    // Receives the order events from haravan and sends them to the order queue
    const data = await ctx.req.json();
    data.haravan_topic = ctx.req.header("x-haravan-topic");
    try {
      if (data.haravan_topic === HARAVAN_TOPIC.PAID) {
        await HaravanERPOrderController.sendToZaloMessageQueue(
          ctx,
          data,
          HARAVAN_DISPATCH_TYPE_ZALO_MSG.PAID,
        );
      } else if (data.haravan_topic === HARAVAN_TOPIC.CREATED) {
        const delayInSeconds = 1800; // 1800 seconds ~ 30 mins
        await HaravanERPOrderController.sendToZaloMessageQueue(
          ctx,
          data,
          HARAVAN_DISPATCH_TYPE_ZALO_MSG.REMIND_PAY,
          delayInSeconds,
        );
      } else {
        await HaravanERPOrderController.sendToZaloMessageQueue(ctx, data);
      }
      await ctx.env["ORDER_QUEUE"].send(data);
      return ctx.json({ message: "Message sent to queue", status: 200 });
    } catch (e) {
      console.error(e);
      return ctx.json({ message: e.message, status: 500 });
    }
  }

  static async sendToZaloMessageQueue(
    ctx,
    data,
    dispatchType = null,
    delayInSeconds = 0,
  ) {
    data.dispatchType = dispatchType;

    const scheduleOptions = this.getZaloMessageSchedule(delayInSeconds);

    await ctx.env["ZALO_MESSAGE_QUEUE"].send(data, scheduleOptions);
  }

  static getZaloMessageSchedule(initialDelayInSeconds = 0) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = formatter.formatToParts(now);
    const get = (t) => parts.find((p) => p.type === t).value;
    const localNow = new Date(
      `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}+07:00`,
    );

    const scheduledTime = new Date(
      localNow.getTime() + initialDelayInSeconds * 1000,
    );
    const scheduledHour = scheduledTime.getHours();
    const scheduledMinute = scheduledTime.getMinutes();

    if (
      (scheduledHour < 21 || (scheduledHour === 21 && scheduledMinute <= 55)) &&
      (scheduledHour > 6 || (scheduledHour === 6 && scheduledMinute >= 5))
    ) {
      return { delaySeconds: initialDelayInSeconds };
    }

    const nextAvailableTime = new Date(scheduledTime);
    nextAvailableTime.setHours(6, 5, 0, 0);

    if (nextAvailableTime <= scheduledTime) {
      nextAvailableTime.setDate(nextAvailableTime.getDate() + 1);
    }

    return { delaySeconds: Math.floor((nextAvailableTime - localNow) / 1000) };
  }
}
