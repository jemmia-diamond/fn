import ERP from "services/erp";
import CustomerSerializer from "services/erp/selling/customer/utils/customer-serializer";

export default class CustomersController {
  static async show(ctx) {
    const { id } = ctx.req.param();
    if (!id) return ctx.json({ success: false, error: "id is required" }, 400);

    const service = new ERP.Selling.CustomerService(ctx.env);
    const customer = await service.fetchCustomerByHrvID(id);
    if (!customer) return ctx.json({ success: false, error: "Customer not found" }, 404);

    return ctx.json({ success: true, data: CustomerSerializer.filteredPII(customer) });
  }
}
