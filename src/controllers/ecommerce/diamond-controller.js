import Ecommerce from "services/ecommerce";

export default class DiamondController {
    static async index(ctx) {
        const params = await ctx.req.query();
        const gia_no = params?.gia_no;

        if (!gia_no) {
            return ctx.json({ message: "Invalid or missing `gia_no` parameter" }, 400);
        }

        const productService = new Ecommerce.ProductService(ctx.env);
        const result = await productService.getDiamondProfileImage(gia_no);
        return ctx.json({ data: result }, 200);
    }
}
