export default class LarkHelper {
  /**
   * Helper to extract text from LarkSuite field (array of text objects)
   * @param {Array|String} field - Field value from LarkSuite
   * @returns {String|null} - Extracted text or null
   */
  static extractText(field) {
    if (!field) return null;
    if (typeof field === "string") return field;
    if (Array.isArray(field) && field.length > 0 && field[0].text) {
      return field[0].text;
    }
    return null;
  }

  /**
   * Helper to extract integer from LarkSuite field
   * @param {Number|Object} field - Field value from LarkSuite
   * @returns {Number|null} - Extracted integer or null
   */
  static extractInt(field) {
    if (!field) return null;
    if (typeof field === "number") return field;
    if (typeof field === "object" && field.value !== undefined) {
      return parseInt(field.value, 10) || null;
    }
    return null;
  }
}
