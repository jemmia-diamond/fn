import NocoDBClient from "services/clients/nocodb-client";

export default class VariantSerialsController {
  static async generateRfid(ctx) {
    const payload = await ctx.req.json();

    if (!payload?.data?.rows?.[0]) {
      return ctx.json({ error: "Invalid payload: no rows found" }, 400);
    }

    const tableId = payload.data.table_id;
    const row = payload.data.rows[0];
    const recordId = row.id;
    const barcode = row.barcode;

    if (!barcode) {
      return ctx.json({ error: "Barcode is missing" }, 400);
    }

    const nocoClient = new NocoDBClient(ctx.env);

    try {
      const record = await nocoClient.readRecord(tableId, recordId);
      if (record?.final_encoded_barcode) {
        return ctx.json({ error: "RFID already generated for this record" }, 400);
      }

      const prefix = barcode.substring(0, 2);
      const hexPrefix = Array.from(new TextEncoder().encode(prefix))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const encodedBarcode = hexPrefix + barcode.substring(2);

      const response = await nocoClient.listRecords(tableId, {
        where: `(final_encoded_barcode,like,${encodedBarcode}%)`,
        sort: "-final_encoded_barcode",
        limit: 1
      });

      const records = response.list || [];
      const maxRfid = records[0]?.final_encoded_barcode;
      let newRfid;
      if (maxRfid) {
        const extension = maxRfid.replace(encodedBarcode, "");
        const extensionValue = parseInt(extension, 10) + 1;
        newRfid = encodedBarcode + String(extensionValue).padStart(11, "0");
      } else {
        newRfid = encodedBarcode + "00000000001";
      }

      await nocoClient.updateRecords(tableId, {
        id: recordId,
        final_encoded_barcode: newRfid
      });

      return ctx.json({ message: "RFID generated successfully", rfid: newRfid }, 200);
    } catch (error) {
      console.warn("Error generating variant RFID:", error);
      return ctx.json({ error: error.message }, 500);
    }
  }
}
