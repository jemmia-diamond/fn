export default class NhattinClient {
  /**
       * @param {string} email The username for the API.
       * @param {string} password The password for the API.
       * @param {string} partnerId The partner_id for the API.
       */
  constructor(email, password, partnerId, baseUrl) {
    this.email = email;
    this.password = password;
    this.partnerId = partnerId;
    this.baseUrl = baseUrl;
  }

  /**
       * Fetches tracking information for a specific bill code.
       * @param {string} billCode The bill code to track (e.g., 'CP1116585033').
       * @returns {Promise<object>} A promise that resolves to the JSON data from the API.
       */
  async trackBill(billCode) {

    const url = new URL(`${this.baseUrl}/bill/tracking`);
    url.searchParams.append("bill_code", billCode);

    const options = {
      method: "GET",
      headers: {
        "username": this.email,
        "password": this.password,
        "partner_id": this.partnerId,
        "Accept": "application/json"
      }
    };

    try {
      const response = await fetch(url, options);

      if (!response.ok) {

        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Failed to fetch tracking data:", error);
      throw error;
    }
  }
}
