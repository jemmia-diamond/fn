export default class ConversationAssignmentController {
  static async show(ctx) {
    const name = ctx.req.param("name");
    ctx.redirect(`https://jemmia.vn/${name}`);
  }
}
