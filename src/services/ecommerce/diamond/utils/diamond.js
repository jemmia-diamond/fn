import { Prisma } from "@prisma-cli";
import { toSqlOrder } from "services/utils/sql-helpers";

const ALLOWED_SORT_COLUMNS = new Set([
  "price",
  "color",
  "clarity",
  "shape",
  "fluorescence"
]);

export function buildFilterString(jsonParams) {
  const filterClauses = [];

  if (jsonParams.shapes && jsonParams.shapes.length > 0) {
    filterClauses.push(Prisma.sql`AND d.shape = ANY(${jsonParams.shapes})\n`);
  }

  if (jsonParams.colors && jsonParams.colors.length > 0) {
    filterClauses.push(Prisma.sql`AND d.color = ANY(${jsonParams.colors})\n`);
  }

  if (jsonParams.clarities && jsonParams.clarities.length > 0) {
    filterClauses.push(
      Prisma.sql`AND d.clarity = ANY(${jsonParams.clarities})\n`
    );
  }

  if (jsonParams.fluorescence && jsonParams.fluorescence.length > 0) {
    filterClauses.push(
      Prisma.sql`AND d.fluorescence = ANY(${jsonParams.fluorescence})\n`
    );
  }

  if (jsonParams.price?.min) {
    filterClauses.push(
      Prisma.sql`AND d.price >= ${parseFloat(jsonParams.price.min)}\n`
    );
  }

  if (jsonParams.price?.max) {
    filterClauses.push(
      Prisma.sql`AND d.price <= ${parseFloat(jsonParams.price.max)}\n`
    );
  }

  if (jsonParams.edge_size?.lower) {
    filterClauses.push(
      Prisma.sql`AND d.edge_size_2 >= ${parseFloat(jsonParams.edge_size.lower)}\n`
    );
  }

  if (jsonParams.edge_size?.upper) {
    filterClauses.push(
      Prisma.sql`AND d.edge_size_2 <= ${parseFloat(jsonParams.edge_size.upper)}\n`
    );
  }

  return filterClauses.length > 0
    ? Prisma.join(filterClauses, " ")
    : Prisma.empty;
}

export function buildSortString(jsonParams) {
  if (jsonParams.sort?.by && ALLOWED_SORT_COLUMNS.has(jsonParams.sort.by)) {
    const order = toSqlOrder(jsonParams.sort.order);
    return Prisma.sql`ORDER BY d.${Prisma.raw(jsonParams.sort.by)} ${order}\n`;
  }
  return Prisma.sql`ORDER BY d.variant_id DESC\n`;
}

export function buildPaginationString(jsonParams) {
  if (jsonParams.pagination) {
    const limit = parseInt(jsonParams.pagination.limit, 10);
    const from = parseInt(jsonParams.pagination.from, 10);
    if (!isNaN(limit) && limit > 0) {
      if (!isNaN(from) && from > 1) {
        return Prisma.sql`LIMIT ${limit} OFFSET ${from - 1}\n`;
      }
      return Prisma.sql`LIMIT ${limit}\n`;
    }
  }
  return Prisma.empty;
}

export function buildGetDiamondsQuery(jsonParams) {
  const filterString = buildFilterString(jsonParams);
  const sortString = buildSortString(jsonParams);
  const paginationString = buildPaginationString(jsonParams);

  const extraFieldsSelection = jsonParams.extraFields?.includes("sku")
    ? Prisma.sql`,\n      d.sku`
    : Prisma.empty;

  const dataSql = Prisma.sql`
    SELECT
      CAST(d.product_id AS INT) AS product_id,
      CAST(d.variant_id AS INT) AS variant_id,
      d.report_no,
      d.shape,
      CAST(d.carat AS DOUBLE PRECISION) AS carat,
      d.color,
      d.clarity,
      d.cut,
      d.fluorescence,
      d.edge_size_1, d.edge_size_2,
      CAST(d.compare_at_price AS DOUBLE PRECISION) as compare_at_price,
      CAST(d.price AS DOUBLE PRECISION) AS price,
      CAST(d.final_discounted_price AS DOUBLE PRECISION) as final_discounted_price,
      d.handle,
      d.title,
      d.images${extraFieldsSelection}
    FROM marts_ecom.fct_ecom_diamonds_catalog d
    WHERE 1 = 1
    ${filterString}
    ${sortString}
    ${paginationString}
  `;

  const countSql = Prisma.sql`
    SELECT COUNT(*) AS total
    FROM marts_ecom.fct_ecom_diamonds_catalog d
    WHERE 1 = 1
    ${filterString}
  `;

  return { dataSql, countSql };
}
