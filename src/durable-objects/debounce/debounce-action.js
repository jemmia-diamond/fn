export const DebounceActions = {
  SEND_TO_MESSAGE_SUMMARY_QUEUE: "SEND_TO_MESSAGE_SUMMARY_QUEUE",
  SEND_TO_PANCAKE_MESSAGE_LAST_INTERACTION_QUEUE: "SEND_TO_PANCAKE_MESSAGE_LAST_INTERACTION_QUEUE",
  SEND_TO_HARAVAN_PRODUCT_QUEUE: "SEND_TO_HARAVAN_PRODUCT_QUEUE",
  SEND_TO_ERPNEXT_SALES_ORDER_QUEUE: "SEND_TO_ERPNEXT_SALES_ORDER_QUEUE",
  SEND_TO_CUSTOMER_LENS_QUEUE: "SEND_TO_CUSTOMER_LENS_QUEUE"
};

export const DebounceKeys = {
  [DebounceActions.SEND_TO_MESSAGE_SUMMARY_QUEUE]: (id) => `summary-conversation-${id}`,
  [DebounceActions.SEND_TO_PANCAKE_MESSAGE_LAST_INTERACTION_QUEUE]: (id) => `interaction-conversation-${id}`,
  [DebounceActions.SEND_TO_HARAVAN_PRODUCT_QUEUE]: (id) => `product-${id}`,
  [DebounceActions.SEND_TO_ERPNEXT_SALES_ORDER_QUEUE]: (id) => `erp-sales-order-${id}`,
  [DebounceActions.SEND_TO_CUSTOMER_LENS_QUEUE]: (id) => `lens-conversation-${id}`
};
