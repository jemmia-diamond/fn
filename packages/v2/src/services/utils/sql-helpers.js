export const escapeSqlValue = (value) => {
  if (value === null || value === undefined) {
    return "NULL";
  } else if (typeof value === "string") {
    return `'${value.replace(/'/g, "''")}'`;
  } else if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  } else if (typeof value === "boolean") {
    return value ? "1" : "0";
  } else if (Array.isArray(value) || typeof value === "object") {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  return value;
};

export async function fetchChildRecordsFromERP(
  frappeClient,
  parentNames,
  tableName
) {
  if (!Array.isArray(parentNames) || parentNames.length === 0) {
    return [];
  }
  const quotedNames = parentNames.map((name) => `"${name}"`).join(", ");
  const sql = `SELECT * FROM \`${tableName}\` WHERE parent IN (${quotedNames})`;
  const childRecords = await frappeClient.executeSQL(sql);
  return childRecords || [];
}
