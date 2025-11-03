export default class CallbackResultsController {
  static async create(ctx) {
    try {
      return ctx.json({ message: "Message receive", status: 200 });
    } catch (e) {
      console.error(e);
      return ctx.json({ message: e.message, status: 500 });
    };
  };
};
