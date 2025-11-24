import Database from "services/database";
import { TABLES } from "services/larksuite/docs/constant";
import { Prisma } from "@prisma-cli/client";
import utc from "dayjs/plugin/utc.js";
import dayjs from "dayjs";
import RecordService from "services/larksuite/docs/base/record/record";
import * as Sentry from "@sentry/cloudflare";

dayjs.extend(utc);

export default class DesignCodeService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  mapToLarkFields(design) {
    return {
      "id": design.id,
      "Mã thiết kế": design.design_code || "",
      "Loại thiết kế": design.design_type || "",
      "Giới tính": design.gender || "",
      "Cover": design.cover || "",
      "Link render": design.link_render
        ? { text: design.link_render, link: design.link_render }
        : null,
      "Code": design.code || "",
      "Erp Code": design.erp_code || "",
      "Backup Code": design.backup_code || "",
      "Tìm kiếm MTK": this.concatenateCodes(
        design.design_code,
        design.code,
        design.erp_code,
        design.backup_code
      )
    };
  }

  concatenateCodes(...codes) {
    return codes.filter(Boolean).join(" - ");
  }

  async findNewDesigns({ limit, offset, updatedAt }) {
    const whereClause = Prisma.sql`
      WHERE (
        ds.design_code IS NOT NULL 
        OR ds.code IS NOT NULL 
        OR ds.backup_code IS NOT NULL 
        OR ds.erp_code IS NOT NULL
      )
      AND dtp.id IS NULL
      ${updatedAt ? Prisma.sql`AND ds.database_updated_at >= ${updatedAt}` : Prisma.empty}
    `;

    return await this.db.$queryRaw`
      SELECT 
        ds.id, ds.design_code, ds.design_type, ds.gender, ds.image_render AS cover, 
        ds.link_render, ds.code, ds.erp_code, ds.backup_code
      FROM workplace.designs AS ds
      LEFT JOIN workplace.designs_temporary_products AS dtp ON ds.id = dtp.id
      ${whereClause}
      LIMIT ${limit}
      OFFSET ${offset || 0};
    `;
  }

  async findUpdateDesigns({ limit, offset, updatedAt }) {
    const whereClause = Prisma.sql`
      WHERE (
        ds.design_code IS NOT NULL 
        OR ds.code IS NOT NULL 
        OR ds.backup_code IS NOT NULL 
        OR ds.erp_code IS NOT NULL
      )
      AND dtp.id IS NOT NULL
      ${updatedAt ? Prisma.sql`AND ds.database_updated_at >= ${updatedAt}` : Prisma.empty}
    `;

    return await this.db.$queryRaw`
      SELECT 
        ds.id, ds.design_code, ds.design_type, ds.gender, ds.image_render as cover, 
        ds.link_render, ds.code, ds.erp_code, ds.backup_code, dtp.lark_record_id   
      FROM workplace.designs AS ds 
      LEFT JOIN workplace.designs_temporary_products AS dtp ON ds.id = dtp.id 
      ${whereClause}
      LIMIT ${limit}
      OFFSET ${offset || 0};
    `;
  }

  async upsertDesigns(records) {
    if (!records || records.length === 0) return [];

    const escape = (value) => {
      if (value === null || value === undefined) return "NULL";
      return `'${String(value).replace(/'/g, "''")}'`;
    };

    const valuesList = records.map((record) => `
      (
            ${record.id},
            ${escape(record.design_code)},
            ${escape(record.design_type)},
            ${escape(record.gender)},
            ${escape(record.cover)},
            ${escape(record.link_render)},
            ${escape(record.code)},
            ${escape(record.erp_code)},
            ${escape(record.backup_code)},
            ${escape(record.lark_record_id)}
          )
    `).join(", ");

    const sql = `
      INSERT INTO workplace.designs_temporary_products (
        id, design_code, design_type, gender, cover, link_render, code, erp_code, backup_code, lark_record_id
      ) VALUES ${valuesList}
      ON CONFLICT (id) DO UPDATE SET
        design_code = EXCLUDED.design_code,
        design_type = EXCLUDED.design_type,
        gender = EXCLUDED.gender,
        cover = EXCLUDED.cover,
        link_render = EXCLUDED.link_render,
        code = EXCLUDED.code,
        erp_code = EXCLUDED.erp_code,
        backup_code = EXCLUDED.backup_code,
        lark_record_id = EXCLUDED.lark_record_id
      RETURNING id;
    `;

    const result = await this.db.$queryRaw`${Prisma.raw(sql)}`;
    return result.map((row) => row.id);
  }

  async syncDesignCodeToLark() {
    const designCodeTableId = TABLES.DESIGN_CODE.table_id;
    const designCodeAppToken = TABLES.DESIGN_CODE.app_token;

    const kv = this.env.FN_KV;
    const KV_KEY = "design_code_to_lark:last_date";
    const lastDate = await kv.get(KV_KEY);

    const minutesBack = 10;
    const fromDate = lastDate || dayjs().utc().subtract(minutesBack, "minutes").format("YYYY-MM-DD HH:mm:ss");
    const toDate = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

    try {
      const newDesigns = await this.findNewDesigns({
        limit: 100,
        updatedAt: fromDate,
        offset: 0
      });

      if (newDesigns && newDesigns.length > 0) {
        const recordItems = newDesigns.map(d => ({
          fields: this.mapToLarkFields(d)
        }));

        const createdRecords = await RecordService.createLarksuiteRecords({
          env: this.env,
          appToken: designCodeAppToken,
          tableId: designCodeTableId,
          records: recordItems,
          userIdType: "open_id"
        });

        if (createdRecords && createdRecords.length === newDesigns.length) {
          const updatedNewDesigns = newDesigns.map((design, idx) => ({
            ...design,
            lark_record_id: createdRecords[idx].record_id
          }));

          await this.upsertDesigns(updatedNewDesigns);
        }
      }

      const existingDesigns = await this.findUpdateDesigns({
        limit: 100,
        updatedAt: fromDate,
        offset: 0
      });

      if (existingDesigns && existingDesigns.length > 0) {
        const updateRecordItems = existingDesigns.map(design => ({
          record_id: design.lark_record_id,
          ...this.mapToLarkFields(design)
        }));

        await RecordService.updateLarksuiteRecords({
          env: this.env,
          appToken: designCodeAppToken,
          tableId: designCodeTableId,
          records: updateRecordItems,
          userIdType: "open_id"
        });

        await this.upsertDesigns(existingDesigns);
      }

      await kv.put(KV_KEY, toDate);
    } catch (error) {
      Sentry.captureException(error);
      if (dayjs(toDate).diff(dayjs(await kv.get(KV_KEY)), "hour") >= 1) {
        await kv.put(KV_KEY, toDate);
      }
    }
  }
}
