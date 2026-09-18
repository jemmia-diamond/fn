import { NOCODB_TABLES } from "src/constants/nocodb-tables";

async function fetchAllRecords(nocodb, table, params = {}, pageSize = 100) {
  const results = [];
  let offset = 0;
  while (true) {
    const res = await nocodb.listRecords(table, {
      ...params,
      limit: pageSize,
      offset
    });
    const page = res.list || [];
    results.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }
  return results;
}

async function fetchBatchRecords(nocodb, table, ids, fields) {
  if (!ids.length) return [];
  const res = await nocodb.listRecords(table, {
    where: `(id,in,${ids.join(",")})`,
    limit: ids.length,
    fields
  });
  return res.list || [];
}

export async function fetchComboTargets(nocodb) {
  const allVsd = await fetchAllRecords(
    nocodb,
    NOCODB_TABLES.SUPPLY.VARIANT_SERIALS_DIAMONDS,
    { sort: "variant_serials_id" }
  );
  if (!allVsd.length) return [];

  const diamondIds = [
    ...new Set(allVsd.map((v) => v.diamonds_id).filter(Boolean))
  ];
  const serialIds = [
    ...new Set(allVsd.map((v) => v.variant_serials_id).filter(Boolean))
  ];

  const [diamondsRes, serialsRes] = await Promise.all([
    fetchBatchRecords(
      nocodb,
      NOCODB_TABLES.SUPPLY.DIAMONDS,
      diamondIds,
      "id,variant_id,product_id"
    ),
    fetchBatchRecords(
      nocodb,
      NOCODB_TABLES.SUPPLY.SERIALS,
      serialIds,
      "id,variant_id"
    )
  ]);

  const diamondMap = new Map(diamondsRes.map((d) => [d.id, d]));
  const serialMap = new Map(serialsRes.map((s) => [s.id, s]));

  const variantIds = [
    ...new Set(serialsRes.map((s) => s.variant_id).filter(Boolean))
  ];
  const variantsRes = await fetchBatchRecords(
    nocodb,
    NOCODB_TABLES.SUPPLY.VARIANTS,
    variantIds,
    "id,haravan_variant_id,haravan_product_id,product_id"
  );
  const variantMap = new Map(variantsRes.map((v) => [v.id, v]));

  const targets = [];
  for (const vsd of allVsd) {
    const diamond = diamondMap.get(vsd.diamonds_id);
    if (
      !diamond ||
      !diamond.variant_id ||
      diamond.variant_id <= 0 ||
      !diamond.product_id ||
      diamond.product_id <= 0
    )
      continue;

    const serial = serialMap.get(vsd.variant_serials_id);
    if (!serial || !serial.variant_id) continue;

    const variant = variantMap.get(serial.variant_id);
    if (
      !variant ||
      !variant.haravan_variant_id ||
      variant.haravan_variant_id <= 0 ||
      !variant.haravan_product_id ||
      variant.haravan_product_id <= 0
    )
      continue;

    targets.push({
      diamonds_id: vsd.diamonds_id,
      variant_serials_id: vsd.variant_serials_id,
      diamond_haravan_variant_id: diamond.variant_id,
      diamond_haravan_product_id: diamond.product_id,
      jewelry_haravan_variant_id: variant.haravan_variant_id,
      jewelry_haravan_product_id: variant.haravan_product_id,
      jewelry_product_workplace_id: variant.product_id,
      diamond_workplace_id: diamond.id
    });
  }
  return targets;
}

export async function fetchComboDiamondIds(nocodb) {
  const targets = await fetchComboTargets(nocodb);
  return new Set(targets.map((t) => t.diamond_workplace_id));
}
