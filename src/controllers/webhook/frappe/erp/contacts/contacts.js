export default class FrappeERPContactsController {
  static async create(ctx) {
    const data = await ctx.req.json();
    data.doc_event = ctx.req.header("Doc-Event");
    await ctx.env["ERPNEXT_CONTACTS_QUEUE"].send(data);
    return ctx.json({ message: "Contacts webhook received", status: 200 });
  }
}
