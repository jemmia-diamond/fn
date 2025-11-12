import * as crypto from "crypto";

const MISA_DEFAULTS = {
  DICTIONARY_TYPE: 3,
  INVENTORY_ITEM_TYPE: 0,
  UNIT_NAME: "Cái",
  BRANCH_ID: "01ea2abc-81da-4386-9f2b-673796bd520d"
};

export default class InventoryItemMappingService {
  /**
   * Get our company's category code convention from SKU
   * @param {string} sku
   * @returns {string} The calculated category code
   * @private
   */
  static #getCategory(sku) {
    if (!sku) {
      return "";
    }

    let parentCategory = null;
    let subCategory = null;

    if (sku.length !== 21) {
      const firstChar = sku[0];
      const secondChar = sku[1];

      if (firstChar === "A") {
        parentCategory = "V-KCTN";
      } else if (firstChar === "D") {
        parentCategory = "V-Moiss";
      } else {
        parentCategory = "";
      }

      if (["Z", "H"].includes(secondChar) && ["Z", "K"].includes(firstChar)) {
        subCategory = "";
      } else {
        subCategory = `-${secondChar}`;
      }
    } else {
      const stChar = sku[0];
      const ndChar = sku.substring(1, 3);
      const rdChar = sku[12];

      if (stChar === "J") {
        parentCategory =
          {
            D: "TS-KCTN",
            M: "TS-Moiss",
            C: "TS-Cubic",
            N: "TS-Tron",
            Z: "TS-Khac"
          }[rdChar] || "";

        if (["RI", "WR"].includes(ndChar)) {
          const gender = sku[3];
          subCategory = `-${ndChar}-${gender}`;
        }
      } else if (stChar === "A") {
        return "PK";
      } else if (stChar === "G") {
        return "QT";
      } else if (stChar === "Z") {
        return "Other";
      }
    }
    return parentCategory + (subCategory || "");
  }

  /**
   * Maps a Haravan product variant to the MISA inventory item format.
   * @param {object} haravanItem
   * @returns {object}
   */
  static transformHaravanItemToMisa(haravanItem, currentTime) {
    const {
      sku,
      product_title: productTitle = "",
      title: variantTitle = "",
      price,
      barcode
    } = haravanItem;

    const category = this.#getCategory(sku);
    const syncMessage = `SP được đồng bộ vào ngày (múi giờ 0+): ${currentTime}`;
    const itemName = `${productTitle} - ${variantTitle}`;
    const description = `${productTitle}. Variant name: ${variantTitle}. ${syncMessage}`;

    return {
      dictionary_type: MISA_DEFAULTS.DICTIONARY_TYPE,
      inventory_item_id: crypto.randomUUID(),
      inventory_item_code: sku,
      inventory_item_name: `${itemName} - ${sku}`,
      inventory_item_type: MISA_DEFAULTS.INVENTORY_ITEM_TYPE,
      fixed_sale_price: price,
      description,
      branch_id: MISA_DEFAULTS.BRANCH_ID,
      expand_field1: barcode,
      expand_field2: variantTitle,
      expand_field3: syncMessage,
      inventory_item_category_code_list: category,
      unit_name: MISA_DEFAULTS.UNIT_NAME
    };
  }
}
