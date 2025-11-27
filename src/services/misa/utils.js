import { getRefOrderChain } from "services/ecommerce/order-tracking/queries/get-initial-order";

/**
 * Get the journal note based on ref order chain
 * Works with both batch processing (pre-fetched orderChain) and individual processing
 *
 * @param {Object} db - Database instance
 * @param {Object} payment - Payment transaction record (QR or Manual)
 * @param {Array} orderChain - Pre-fetched order chain
 * @returns {Promise<string>} Journal note for MISA voucher
 */
async function getJournalNote(db, payment, orderChain = null) {
  const defaultNote = payment.haravan_order?.order_number || payment.haravan_order_name;

  if (!payment.haravan_order?.ref_order_id) {
    return defaultNote;
  }

  let chain = orderChain;
  if (!chain) {
    chain = await getRefOrderChain(db, payment.haravan_order_id, true);
  }

  if (!chain || chain.length === 0) {
    return defaultNote;
  }

  const lastOrder = chain[chain.length - 1];
  let finalNote = lastOrder.order_number;

  const previousOrders = chain.slice(0, -1);
  const firstPaidCanceledOrder = previousOrders.find(order =>
    (order.financial_status === "paid" || order.financial_status === "partially_paid") &&
    order.order_processing_status === "cancel"
  );

  if (firstPaidCanceledOrder) {
    finalNote = `${lastOrder.order_number} (${firstPaidCanceledOrder.order_number})`;
  }

  return finalNote;
}

export default {
  getJournalNote
};
