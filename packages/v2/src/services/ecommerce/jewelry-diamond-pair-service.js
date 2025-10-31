import Database from "services/database";
import { BadRequestException } from "src/exception/exceptions";
import * as Sentry from "@sentry/cloudflare";

export default class JewelryDiamondPairService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  /**
   * Finds jewelry-diamond pairs where the associated diamond is out of stock
   * or not available in the specified warehouses.
   * @returns {Promise<Array<Object>>} A list of out-of-stock pairs with relevant diamond details.
   */
  async findOutOfStockPairs() {
    try {
      const outOfStockPairs = await this.db.$queryRaw`
        SELECT
          jdp.id AS pair_id,
          jdp.haravan_product_id,
          jdp.haravan_variant_id,
          jdp.haravan_diamond_product_id AS old_diamond_product_id,
          jdp.haravan_diamond_variant_id AS old_diamond_variant_id
        FROM ecom.jewelry_diamond_pairs jdp
        INNER JOIN workplace.diamonds dia
          ON dia.product_id = jdp.haravan_diamond_product_id
         AND dia.variant_id = jdp.haravan_diamond_variant_id
        WHERE jdp.is_active = TRUE
          AND NOT EXISTS (
            SELECT 1
            FROM haravan.warehouse_inventories inven
            INNER JOIN haravan.warehouses house 
              ON house.id = inven.loc_id
            WHERE inven.product_id = dia.product_id
              AND inven.qty_available > 0
              AND house.name IN (
                '[HCM] Cửa Hàng HCM',
                '[HN] Cửa Hàng HN',
                '[CT] Cửa Hàng Cần Thơ'
              )
          );
      `;
      return outOfStockPairs;
    } catch (e) {
      Sentry.captureException(e);
      return [];
    }
  }

  async isDiamondOutOfStock(diamondProductId, diamondVariantId) {
    try {
      const result = await this.db.$queryRaw`
        SELECT 1
        FROM workplace.diamonds dia
        WHERE dia.product_id = ${diamondProductId}
          AND dia.variant_id = ${diamondVariantId}
          AND NOT EXISTS (
            SELECT 1
            FROM haravan.warehouse_inventories inven
            INNER JOIN haravan.warehouses house 
              ON house.id = inven.loc_id
            WHERE inven.product_id = dia.product_id
              AND inven.qty_available > 0
              AND house.name IN (
                '[HCM] Cửa Hàng HCM',
                '[HN] Cửa Hàng HN',
                '[CT] Cửa Hàng Cần Thơ'
              )
          )
        LIMIT 1;
      `;
      return result.length > 0;
    } catch (e) {
      Sentry.captureException(e);
      return false;
    }
  }

  /**
   * Finds a suitable replacement diamond for a given out-of-stock pair.
   * @param {Object} currentPair The out-of-stock jewelry-diamond pair details.
   * @returns {Promise<Object|null>} The replacement diamond's product and variant IDs, or null if not found.
   */
  async findReplacementDiamond(currentPair) {
    try {
      const replacementDiamond = await this.db.$queryRaw`
        SELECT
          dia.product_id AS new_diamond_product_id,
          dia.variant_id AS new_diamond_variant_id
        FROM workplace.diamonds dia
        WHERE dia.edge_size_2 >= 4.5 AND dia.edge_size_2 < 4.6
          AND EXISTS (
            SELECT 1
            FROM haravan.warehouse_inventories inven
            INNER JOIN haravan.warehouses house 
              ON house.id = inven.loc_id
            WHERE inven.product_id = dia.product_id
              AND inven.qty_available > 0
              AND house.name IN (
                '[HCM] Cửa Hàng HCM',
                '[HN] Cửa Hàng HN',
                '[CT] Cửa Hàng Cần Thơ'
              )
          )
          AND NOT EXISTS (
            SELECT 1
            FROM ecom.jewelry_diamond_pairs existing_jdp
            WHERE existing_jdp.haravan_product_id = ${currentPair.haravan_product_id}
              AND existing_jdp.haravan_variant_id = ${currentPair.haravan_variant_id}
              AND existing_jdp.haravan_diamond_product_id = dia.product_id
              AND existing_jdp.haravan_diamond_variant_id = dia.variant_id
              AND existing_jdp.is_active = TRUE
          )
        ORDER BY dia.price ASC 
        LIMIT 1;
      `;
      return replacementDiamond?.[0] || null;
    } catch (e) {
      Sentry.captureException(e);
      return null;
    }
  }

  /**
   * Deactivates an old jewelry-diamond pair and creates a new one with a replacement diamond.
   * @param {Object} oldPair The details of the out-of-stock pair.
   * @param {Object} newDiamond The details of the replacement diamond.
   */
  async replaceJewelryDiamondPair(oldPair, newDiamond) {
    try {
      const [_deactivatedPair, newPair] = await this.db.$transaction([
        this.db.jewelryDiamondPairing.update({
          where: {
            id: oldPair.pair_id
          },
          data: {
            is_active: false,
            updated_at: new Date()
          }
        }),
        this.db.jewelryDiamondPairing.create({
          data: {
            haravan_product_id: oldPair.haravan_product_id,
            haravan_variant_id: oldPair.haravan_variant_id,
            haravan_diamond_product_id: Number(newDiamond.new_diamond_product_id),
            haravan_diamond_variant_id: Number(newDiamond.new_diamond_variant_id),
            is_active: true
          }
        })
      ]);
      return newPair;
    } catch (e) {
      Sentry.captureException(e);
      return null;
    }
  }

  /**
   * Handles a manual request to replace an out-of-stock diamond for a specific jewelry variant.
   * @param {Object} body The request body containing the IDs of the pair.
   * @returns {Promise<Object>} The newly created jewelry-diamond pair.
   */
  async handleManualReplacement(body) {
    const {
      haravan_product_id,
      haravan_variant_id,
      haravan_diamond_product_id,
      haravan_diamond_variant_id
    } = body;

    const isOutOfStock = await this.isDiamondOutOfStock(haravan_diamond_product_id, haravan_diamond_variant_id);
    if (!isOutOfStock) {
      throw new BadRequestException("Diamond is not out of stock. No action taken.");
    }

    const oldPairRecord = await this.db.jewelryDiamondPairing.findFirst({
      where: {
        haravan_product_id,
        haravan_variant_id,
        haravan_diamond_product_id,
        haravan_diamond_variant_id,
        is_active: true
      },
      select: {
        id: true,
        haravan_product_id: true,
        haravan_variant_id: true
      }
    });

    if (!oldPairRecord) {
      throw new BadRequestException("Active jewelry-diamond pair not found for the given IDs.");
    }

    const oldPair = {
      pair_id: oldPairRecord.id,
      haravan_product_id: oldPairRecord.haravan_product_id,
      haravan_variant_id: oldPairRecord.haravan_variant_id
    };

    const replacement = await this.findReplacementDiamond(oldPair);
    if (!replacement) {
      throw new BadRequestException("No suitable replacement diamond found.");
    }
    return this.replaceJewelryDiamondPair(oldPair, replacement);
  }

  /**
   * Main function to process out-of-stock diamonds and find replacements.
   */
  async processOutOfStockDiamonds() {
    const outOfStockPairs = await this.findOutOfStockPairs();

    for (const pair of outOfStockPairs) {
      const replacement = await this.findReplacementDiamond(pair);
      if (replacement) {
        await this.replaceJewelryDiamondPair(pair, replacement);
      }
    }
  }
}
