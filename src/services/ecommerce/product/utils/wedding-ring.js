import { Prisma } from "@prisma-cli";
import { toSqlOrder } from "services/utils/sql-helpers";

export function buildWeddingRingsQuery(jsonParams) {
  const { filterSql, sortSql, paginationSql } = aggregateQuery(jsonParams);

  const dataSql = findDataSql({
    filterSql,
    sortSql,
    paginationSql
  });

  const countSql = findCountSql({
    filterSql
  });
  return {
    dataSql,
    countSql
  };
}

export function buildWeddingRingByIdQuery(weddingRingId) {
  const sortSql = Prisma.empty;
  const paginationSql = Prisma.empty;
  const filterSql = Prisma.sql`
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(wr.products::jsonb) p
      WHERE (p->>'id')::bigint = ${weddingRingId}
    )
  `;
  const dataSql = findDataSql({
    filterSql,
    sortSql,
    paginationSql
  });
  return dataSql;
}

export function findDataSql({ filterSql, sortSql, paginationSql }) {
  const dataSql = Prisma.sql`
    SELECT 
        wr.id,
        wr.title,
        wr.products
    FROM marts_ecom.fct_ecom_wedding_rings wr
    WHERE 1 = 1
    ${filterSql}
    ${sortSql}
    ${paginationSql}
  `;
  return dataSql;
}

export function findCountSql({ filterSql }) {
  const countSql = Prisma.sql`
    SELECT 
      CAST(COUNT(DISTINCT wr.id) AS INT) AS total,
      (SELECT ARRAY_AGG(DISTINCT mwr.fineness) FROM marts_ecom.fct_ecom_wedding_rings mwr WHERE mwr.fineness NOT LIKE '%,%' ) AS fineness,
      (SELECT ARRAY_AGG(DISTINCT mwr.material_colors ) FROM marts_ecom.fct_ecom_wedding_rings mwr WHERE mwr.material_colors NOT LIKE '%,%' ) AS material_colors
    FROM marts_ecom.fct_ecom_wedding_rings wr
    WHERE 1 = 1
    ${filterSql}
  `;
  return countSql;
}

export function aggregateQuery(jsonParams) {
  let paginationSql = Prisma.empty;
  let sortSql = Prisma.empty;
  let filterSql = Prisma.empty;

  if (jsonParams.pagination) {
    paginationSql = Prisma.sql`LIMIT ${jsonParams.pagination.limit} `;
    if (jsonParams.pagination.from !== 1) {
      paginationSql = Prisma.sql`${paginationSql} OFFSET ${jsonParams.pagination.from - 1}\n`;
    }
  }

  if (jsonParams.fineness && jsonParams.fineness.length > 0) {
    const patterns = jsonParams.fineness.map((f) => `%${f}%`);
    filterSql = Prisma.sql`${filterSql} AND wr.fineness LIKE ANY(${patterns})\n`;
  }

  if (jsonParams.material_colors && jsonParams.material_colors.length > 0) {
    const patterns = jsonParams.material_colors.map((color) => `%${color}%`);
    filterSql = Prisma.sql`${filterSql} AND wr.material_colors LIKE ANY(${patterns})\n`;
  }

  if (jsonParams.is_in_stock) {
    filterSql = Prisma.sql`${filterSql} AND wr.qty_onhand > 0\n`;
  }

  if (jsonParams.price?.min) {
    filterSql = Prisma.sql`${filterSql} AND wr.min_price >= ${jsonParams.price.min}\n`;
  }

  if (jsonParams.price?.max) {
    filterSql = Prisma.sql`${filterSql} AND wr.max_price <= ${jsonParams.price.max}\n`;
  }
  const order = toSqlOrder(jsonParams.sort?.order);

  const sortStrategies = {
    price: () =>
      Prisma.sql`ORDER BY ${jsonParams.sort?.order === "asc" ? Prisma.raw("wr.min_price") : Prisma.raw("wr.max_price")} ${order}\n`,
    stock: () => Prisma.sql`ORDER BY wr.qty_onhand ${order}\n`,
    sold_quantity: () => Prisma.sql`ORDER BY COALESCE(wr.sold_quantity, 0) ${order}\n`,
    created_date: () => Prisma.sql`ORDER BY wr.id ${order}\n`
  };

  if (jsonParams.sort?.by && sortStrategies[jsonParams.sort.by]) {
    sortSql = sortStrategies[jsonParams.sort.by]();
  }

  if (jsonParams.product_ids && jsonParams.product_ids.length > 0) {
    const productIds = jsonParams.product_ids.map((id) =>
      typeof id === "string" ? BigInt(id) : id
    );
    filterSql = Prisma.sql`
      ${filterSql}
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(wr.products::jsonb) p
        WHERE (p->>'id')::bigint = ANY(${productIds})
      )
    `;
  }

  return {
    filterSql,
    sortSql,
    paginationSql
  };
}

export function toSlug(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function hasImageForMaterialColor(images, materialColor) {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return false;
  }
  if (!materialColor) {
    return true;
  }
  const slug = toSlug(materialColor);
  if (!slug) return true;

  return images.some((img) => {
    if (typeof img !== "string") return false;
    const normalizedImg = img.toLowerCase().replace(/_/g, "-");
    return normalizedImg.includes(slug);
  });
}

export function filterWeddingRingVariants(item) {
  if (!item) return item;
  let products = item.products;
  if (typeof products === "string") {
    try {
      products = JSON.parse(products);
    } catch {
      products = [];
    }
  }
  if (Array.isArray(products)) {
    products = products.map((product) => {
      if (!product) return product;
      const images = Array.isArray(product.images) ? product.images : [];
      const variants = Array.isArray(product.variants) ? product.variants : [];
      const filteredVariants = variants.filter((variant) =>
        hasImageForMaterialColor(images, variant?.material_color)
      );
      return {
        ...product,
        variants: filteredVariants
      };
    });
  }
  return {
    ...item,
    products
  };
}
