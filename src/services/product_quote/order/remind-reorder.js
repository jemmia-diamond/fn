import Database from "services/database";
import LarksuiteService from "services/larksuite/lark";
import { Prisma } from "@prisma-cli";

export default class ProductQuoteRemindReorderService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env, "neon");
  }

  static async remindReorderOnHandTempProduct(env) {
    const service = new ProductQuoteRemindReorderService(env);
    const db = service.db;

    const larkClient = await LarksuiteService.createClientV2(env);
    try {
      const now = new Date();
      const midnightDate = new Date(now.getFullYear(), now.getMonth(), now.getDay(), 0, 0, 0);
      const midnightTimestamp = midnightDate.toISOString();

      // JEWELRY (Serial-based)
      const jewelryIdsToUpdate = await service.processJewelryNotifications(db, midnightTimestamp, larkClient, env.LARK_TBDH_GROUP_CHAT_ID);

      // DIAMOND (GIA-based)
      const diamondIdsToUpdate = await service.processDiamondNotifications(db, midnightTimestamp, larkClient, env.LARK_TBDH_GROUP_CHAT_ID);

      return {
        success: true,
        jewelryNotifiedCount: jewelryIdsToUpdate.length,
        diamondsNotifiedCount: diamondIdsToUpdate.length
      };

    } catch (error) {
      console.error("Error in remindReorderOnHandTempProduct:", error);
      return { success: false, error: error.message };
    }
  }

  async processJewelryNotifications(db, timestamp, larkClient, groupId) {
    const inventoryCheckLines = await db.$queryRaw`
        SELECT ics.rfid_tags, ics.sku, ics.barcode 
        FROM inventory_cms.inventory_check_lines as ics
        WHERE date_created >= ${timestamp}
        ORDER BY ics.date_created DESC;
  `;

    let listFinalEncodedBarcode = [];
    for (const line of inventoryCheckLines) {
      if (line.sku.split("-").length === 1) {
        let rfidTagsList = Array.isArray(line.rfid_tags) ? line.rfid_tags : JSON.parse(line.rfid_tags || "[]");
        if (rfidTagsList.length > 0) listFinalEncodedBarcode.push(...rfidTagsList);
      }
    }

    if (listFinalEncodedBarcode.length === 0) {
      return [];
    }

    const upperCaseBarcodes = listFinalEncodedBarcode.map(item => item.toUpperCase());
    const resultString = upperCaseBarcodes
      .map(item => `'${item.toUpperCase()}'`)
      .join(", ");

    const dataSql = `
      WITH vs_filtered AS (
          SELECT vs.serial_number, vs.order_reference, v.sku, v.barcode, vs.id as variant_serial_id FROM workplace.variant_serials AS vs 
          LEFT JOIN workplace.variants as v ON vs.variant_id = v.id 
          WHERE vs.final_encoded_barcode IN (${resultString})
      ),
      serial_with_order AS (
      SELECT hrv_orders.id AS order_id, hrv_orders.name, vs_f.serial_number, vs_f.sku, vs_f.barcode, vs_f.variant_serial_id FROM vs_filtered AS vs_f
      LEFT JOIN haravan.orders as hrv_orders ON vs_f.order_reference = hrv_orders.name 
      ),                    
      line_item_temp AS (
          SELECT * FROM haravan.line_items as hl
          LEFT JOIN bizflycrm.line_items as bl on hl.variant_id::TEXT = bl.variant_id
          WHERE title LIKE '%Tạm%' AND serial_number_value IS NOT NULL and serial_number_value != ''
      ),
      vs_with_temp_orders AS (
      SELECT 
          swo.order_id,
          swo.name,
          swo.serial_number,
          swo.barcode,
          swo.sku,
          swo.variant_serial_id 
      FROM 
          line_item_temp AS lit
      JOIN 
          serial_with_order AS swo ON lit.serial_number_value LIKE '%' || swo.serial_number || '%' 
      LEFT JOIN workplace.temporary_products as tp ON swo.variant_serial_id = tp.variant_serial_id 
      WHERE tp.is_notify_lark_reorder = false OR tp.is_notify_lark_reorder IS NULL
      )                
                  
      SELECT DISTINCT ON (vs_with_temp_orders.serial_number) 
                      vs_with_temp_orders.serial_number, 
                      vs_with_temp_orders.name, 
                      vs_with_temp_orders.barcode,
                      vs_with_temp_orders.sku,
                      vs_with_temp_orders.variant_serial_id,
                      clm.lark_message_id, 
                      clm.order_id, 
                      clm.parent_id 
                      FROM vs_with_temp_orders  
                      LEFT JOIN larksuite.crm_lark_message AS clm 
                      ON vs_with_temp_orders.order_id = clm.order_id 
                      WHERE clm.parent_id IS NULL;
  `;

    const notifyResult = await db.$queryRaw`${Prisma.raw(dataSql)}`;

    const variantSerialIdsToUpdate = [];

    for (const row of notifyResult) {
      const message = this.composeSendJewelryMessage(row.serial_number, row.barcode.toUpperCase(), row.sku);
      if (row.lark_message_id && !variantSerialIdsToUpdate.includes(row.variant_serial_id)) {
        const success = await larkClient.im.message.reply({
          path: {
            message_id: row.lark_message_id
          },
          data: {
            receive_id: groupId,
            msg_type: "text",
            reply_in_thread: true,
            content: JSON.stringify({
              text: message
            })
          }
        });
        if (success) {
          variantSerialIdsToUpdate.push(row.variant_serial_id);
        }
      }
    }

    if (variantSerialIdsToUpdate.length > 0) {
      const updateSql = `UPDATE workplace.temporary_products 
            SET is_notify_lark_reorder = true 
            WHERE variant_serial_id IN (${variantSerialIdsToUpdate.map(item => `'${item}'`).join(", ")})`;
      await db.$queryRaw`${Prisma.raw(updateSql)}`;
    }
    return variantSerialIdsToUpdate;
  }

  async processDiamondNotifications(db, timestamp,larkClient, groupId) {
    const giaResult = await db.$queryRaw`
      SELECT li.sku FROM haravan.line_items AS li 
      LEFT JOIN haravan.warehouse_inventories AS hw ON li.variant_id = hw.variant_id 
      WHERE li.sku LIKE '%-GIA%' AND li.database_updated_at >= ${timestamp}
      GROUP BY li.sku 
      HAVING SUM(hw.qty_onhand) > 0;
    `;

    let giaList = giaResult.map(line => line.sku.split("-")[1]).filter(part => part && part.startsWith("GIA"));
    giaList = this.preprocessGiaList(giaList);

    if (giaList.length === 0) {
      console.warn("No new diamond GIA numbers found to process.");
      return [];
    }

    const conditions = giaList
      .map(gia => `gia_report_no LIKE '%${gia}%'`)
      .join(" OR ");

    const dataSql = `
          WITH selected_products AS (
              SELECT haravan_variant_id, gia_report_no
              FROM workplace.temporary_products
              WHERE (${conditions}) 
              AND (is_notify_lark_reorder IS NULL OR is_notify_lark_reorder = false) 
          ),
          joined_orders AS (
              SELECT 
                  lpv.order_id, 
                  sp.haravan_variant_id, 
                  sp.gia_report_no
              FROM selected_products sp
              LEFT JOIN haravan.line_items lpv 
                  ON sp.haravan_variant_id = lpv.variant_id
              LEFT JOIN haravan.orders ord
                  ON lpv.order_id = ord.id
          )

          SELECT crm.*, jo.gia_report_no as gia_report_no, jo.haravan_variant_id as haravan_variant_id 
          FROM joined_orders jo
          LEFT JOIN larksuite.crm_lark_message crm ON jo.order_id = crm.order_id 
          WHERE crm.parent_id is NULL;
    `;

    const giaNotifyResult = await db.$queryRaw`${Prisma.raw(dataSql)}`;

    const haravanVariantIdsToUpdate = [];
    for (const row of giaNotifyResult) {
      const message = this.composeSendDiamondMessage(row.gia_report_no);
      if (row.lark_message_id && !haravanVariantIdsToUpdate.includes(row.haravan_variant_id)) {
        const success = await larkClient.im.message.reply({
          path: {
            message_id: row.lark_message_id
          },
          data: {
            receive_id: groupId,
            msg_type: "text",
            reply_in_thread: true,
            content: JSON.stringify({
              text: message
            })
          }
        });
        if (success) {
          haravanVariantIdsToUpdate.push(row.haravan_variant_id);
        }
      }
      try {
      } catch (e) {
        console.error(`Failed to send Lark reply for GIA ${row.gia_report_no}:`, e.code, e.msg);
      }
    }

    if (haravanVariantIdsToUpdate.length > 0) {
      const updateSql = `
            UPDATE workplace.temporary_products 
            SET is_notify_lark_reorder = true 
            WHERE haravan_variant_id IN (${haravanVariantIdsToUpdate.map(item => `'${item}'`).join(", ")})`;
      await db.$queryRaw`${Prisma.raw(updateSql)}`;
    }
    return haravanVariantIdsToUpdate;
  }

  composeSendJewelryMessage(serialNumber, barcode, sku) {
    return `<b>HÀNG VỀ</b>
Số serial: ${serialNumber}
Barcode: ${barcode} 
SKU: ${sku}
Vui lòng đặt lại đơn hàng
`;
  }

  composeSendDiamondMessage(giaReportNo) {
    return `<b>HÀNG VỀ</b>
Kim cương có mã GIA${giaReportNo}
Vui lòng đặt lại đơn hàng
`;
  }

  preprocessGiaList (giaList) {
    return giaList.map(gia => {
      return gia.startsWith("GIA") ? gia.slice(3) : gia;
    });
  };
}
