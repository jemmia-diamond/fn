import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

export default class SubmittedCodesController {
  static async process(ctx) {
    const payload = await ctx.req.json();
    const type = ctx.req.query("type");

    if (!payload?.data?.rows?.[0]) {
      return ctx.json({ error: "Invalid payload: no rows found" }, 400);
    }

    const tableId = payload.data.table_id;
    const row = payload.data.rows[0];
    const recordId = row.id;

    const nocoClient = new NocoDBClient(ctx.env);

    const record = await nocoClient.readRecord(tableId, recordId);
    const codesString = record?.codes || "";
    const tag = (record?.tag || "").trim();

    const codes = codesString
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);

    if (codes.length === 0) {
      return ctx.json({ message: "No codes to process" }, 200);
    }

    let designsTableId = NOCODB_TABLES.RD.DESIGNS;
    if (tableId === NOCODB_TABLES.MARKETING.SUBMITTED_CODES) {
      designsTableId = NOCODB_TABLES.MARKETING.DESIGNS;
    }

    const codesList = codes.map((c) => encodeURIComponent(c)).join(",");
    const filter = `(design_code,in,${codesList})~or(code,in,${codesList})~or(erp_code,in,${codesList})~or(backup_code,in,${codesList})`;

    const response = await nocoClient.listRecords(designsTableId, {
      where: filter,
      limit: 1000
    });

    const matchedRows = response.list || [];

    if (type === "checkout") {
      const designIdCounts = {};
      for (const d of matchedRows) {
        if (d.id !== null && d.id !== undefined) {
          designIdCounts[d.id] = (designIdCounts[d.id] || 0) + 1;
        }
      }

      const duplicatesCodes = [];
      const notFoundCodes = [];

      for (const code of codes) {
        const matches = matchedRows.filter(
          (d) =>
            d.design_code === code ||
            d.code === code ||
            d.erp_code === code ||
            d.backup_code === code
        );

        if (matches.length === 0) {
          notFoundCodes.push(code);
        } else {
          const hasDuplicateDesign = matches.some(
            (d) => designIdCounts[d.id] > 1
          );
          if (hasDuplicateDesign || matches.length > 1) {
            duplicatesCodes.push(code);
          }
        }
      }

      const uniqueDuplicates = [...new Set(duplicatesCodes)];
      const uniqueNotFound = [...new Set(notFoundCodes)];

      const formatCodesList = (arr) => {
        const sorted = [...arr].sort();
        return sorted.map((c) => `         ${c}`).join("\n");
      };

      const notes =
        "Duplicates:\n" +
        formatCodesList(uniqueDuplicates) +
        "\nNot Found in RnD Designs Table:\n" +
        formatCodesList(uniqueNotFound);

      await nocoClient.updateRecords(tableId, {
        id: recordId,
        notes: notes
      });

      return ctx.json(
        { message: "Check out completed, notes updated", notes },
        200
      );
    } else {
      const designIds = [...new Set(matchedRows.map((r) => r.id))];
      const erpCodes = [
        ...new Set(matchedRows.filter((r) => r.erp_code).map((r) => r.erp_code))
      ];

      let applyFilter = `(id,in,${designIds.join(",")})`;
      if (erpCodes.length > 0) {
        const escapedErpCodes = erpCodes
          .map((c) => encodeURIComponent(c))
          .join(",");
        applyFilter += `~or(erp_code,in,${escapedErpCodes})`;
      }

      const allMatchedResponse = await nocoClient.listRecords(designsTableId, {
        where: applyFilter,
        limit: 1000
      });

      const allMatchedRows = allMatchedResponse.list || [];
      const uniqueMatchedIds = [...new Set(allMatchedRows.map((r) => r.id))];
      const updatePayload = uniqueMatchedIds.map((id) => ({ id, tag }));

      if (updatePayload.length > 0) {
        await nocoClient.updateRecords(designsTableId, updatePayload);
      }

      return ctx.json(
        { message: "Tag applied to matched designs successfully" },
        200
      );
    }
  }
}
