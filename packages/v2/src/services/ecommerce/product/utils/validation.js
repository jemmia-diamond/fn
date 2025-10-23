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

export const validateParams = (jsonParams) => {
  let isValidated = true;
  let message = "";
  for (const key in validationData) {
    if (jsonParams[key]) {
      for (const value of jsonParams[key]) {
        if (!validationData[key].includes(value)) {
          isValidated = false;
          message = `Invalid ${key}: ${value}`;
          break;
        }
      }
    }
  }
  return { isValidated, message };
};
