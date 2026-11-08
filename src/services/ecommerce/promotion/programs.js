import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

export const PROMOTION_PROGRAM = {
  JEWELRY_BASE: "jewelry_base",
  DIAMOND_BASELINE: "diamond_baseline",
  DIAMOND_TIER: "diamond_tier",
  COMBO: "combo"
};

export const DIAMOND_PROGRAM_WHERE = `(discount_type,eq,percent)~and(discount_value,gt,0)~and((program,eq,${PROMOTION_PROGRAM.DIAMOND_BASELINE})~or(program,eq,${PROMOTION_PROGRAM.DIAMOND_TIER}))`;

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = null;

export async function fetchPromotionPrograms(env, { fresh = false } = {}) {
  if (!fresh && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rows;
  }

  const nocodb = new NocoDBClient(env);
  const res = await nocodb.listRecords(
    NOCODB_TABLES.MARKETING.HARAVAN_COLLECTIONS,
    {
      where: "(program,isnot,null)",
      fields: "id,title,haravan_id,discount_type,discount_value,program",
      limit: 1000
    }
  );
  const rows = res.list || [];
  cache = { fetchedAt: Date.now(), rows };
  return rows;
}

export function findProgram(rows, program) {
  return rows.find((row) => row.program === program) || null;
}
