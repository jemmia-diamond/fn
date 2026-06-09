export function getOrderFinancials(order) {
  const paidAmount =
    order?.transactions
      ?.filter(t =>
        ["capture", "authorization", "sale"].includes(t?.kind?.toLowerCase())
      )
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0;

  const totalPrice = parseFloat(order?.total_price) || 0;
  const remainingBalance = Math.max(0, totalPrice - paidAmount);

  return {
    totalPrice,
    paidAmount,
    remainingBalance
  };
}
