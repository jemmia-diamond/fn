import { getRefOrderChain } from "services/ecommerce/order-tracking/queries/get-initial-order";

/**
 * Get the journal note based on ref order chain
 * Works with both batch processing (pre-fetched orderChain) and individual processing
 *
 * @param {Object} db - Database instance
 * @param {Object} payment - Payment transaction record (QR or Manual)
 * @param {Array} orderChain - Pre-fetched order chain
 * @param {Number} haravanOrderId - Haravan order ID to use if payment is null
 * @param {String} haravanOrderNumber - Haravan order name to use if payment is null
 * @returns {Promise<string>} Journal note for MISA voucher
 */
async function getJournalNote(db, payment = null, orderChain = null, haravanOrderId = null, haravanOrderNumber = null, haravanRefOrderId = null) {
  const defaultNote = payment?.haravan_order?.order_number || payment?.haravan_order_name || haravanOrderNumber;
  const orderId = payment?.haravan_order_id || haravanOrderId;

  if (!payment?.haravan_order?.ref_order_id || !haravanRefOrderId) {
    return defaultNote;
  }

  let chain = orderChain;
  if (!chain) {
    chain = await getRefOrderChain(db, orderId, true);
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
