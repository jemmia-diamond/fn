function processSize(text) {
  return Number.isInteger(Number(text)) ? text + "ly" : text.toString().replace(".", "ly");
}

function dataAgg(rows, title) {
  const ALL_COLORS = ["D", "E", "F", "G", "H", "I"];
  const ORDERED_CLARITIES = ["IF", "VVS1", "VVS2", "VS1", "VS2"];

  const filtered = rows.filter(r => r.title === title);

  const temp = {};

  for (const row of filtered) {
    const clarity = row.clarity || "";
    const color = row.color || "";

    if (!temp[clarity]) temp[clarity] = {};

    const price_compare_at = row.price != null ? Number(row.price) : null;
    const price = row.sale_off_price != null ? Number(row.sale_off_price) : null;

    if (price_compare_at !== null || price !== null) {
      temp[clarity][color] = { price_compare_at, price };
    }
  }

  const result = {};

  for (const clarity of ORDERED_CLARITIES) {
    if (!temp[clarity]) continue;

    const colors = ALL_COLORS.filter(c => temp[clarity][c]);

    if (colors.length === 0) continue;

    result[clarity] = {};
    for (const color of colors) {
      result[clarity][color] = temp[clarity][color];
    }
  }

  return result;
}

export function formatData(rows) {
  const titles = [...new Set(rows.map(r => r.title))];

  return titles.map(title => ({
    size: processSize(title),
    data: dataAgg(rows, title)
  }));
}
