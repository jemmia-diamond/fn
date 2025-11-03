import JewelryDiamondPairService from "services/ecommerce/jewelry-diamond-pair-service";
import { BadRequestException } from "src/exception/exceptions";

export default class JewelryDiamondPairController {
  static create = async (c) => {
    try {
      const body = await c.req.json();

      if (!body.haravan_product_id || !body.haravan_variant_id || !body.haravan_diamond_product_id || !body.haravan_diamond_variant_id) {
        return c.json({
          success: false,
          message: "Missing required fields: haravan_product_id, haravan_variant_id, haravan_diamond_product_id, haravan_diamond_variant_id"
        }, 400);
      }

      const service = new JewelryDiamondPairService(c.env);
      const newPair = await service.handleManualReplacement(body);

      return c.json({ success: true, data: newPair });
    } catch (e) {
      if (e instanceof BadRequestException) {
        return c.json({
          success: false,
          message: e.message
        }, 400);
      }
      return c.json({
        success: false,
        message: e.message
      }, 500);
    }
  };
}
