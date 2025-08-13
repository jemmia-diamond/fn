export const validationData = {
  fineness: ["Vàng 18K", "Vàng 14K"],
  material_colors: [
    "Vàng Trắng",
    "Vàng Hồng",
    "Vàng Vàng",
    "Vàng Trắng - Vàng Hồng",
    "Vàng Trắng - Vàng Vàng",
    "Vàng Hồng - Vàng Vàng"
  ],
  sort_by: ["price", "stock"],
  sort_order: ["asc", "desc"]
};

export const isValidated = (jsonParams) => {
  for (const key in jsonParams) {
    if (!validationData[key].includes(jsonParams[key])) {
      return false;
    }
  }
  return true;
};
