export const JEMMIA_SHIELD_MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  INTERACTIVE: "interactive",
  POST: "post"
} as const;

export const JEMMIA_SHIELD_CONTENT_TAG = {
  TEXT: "text",
  IMG: "img",
  HREF: "a",
  AT: "at"
} as const;

export const JEMMIA_SHIELD_NER_SCORE_THRESHOLD = 0.5;

export const ORDER_REGEX = /ORDER(\d+)/g;
