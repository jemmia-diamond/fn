import LarkBaseClient from "services/clients/lark-client/base-client.js";

export default class SheetConnector {
  constructor(env) {
    this.client = new LarkBaseClient(env);
  }

  async resolveSpreadsheetToken(wikiNodeToken) {
    const res = await this.client.get("/wiki/v2/spaces/get_node", { token: wikiNodeToken });
    const node = res?.data?.node;
    if (!node?.obj_token) {
      throw new Error(`Wiki node ${wikiNodeToken} has no obj_token (obj_type=${node?.obj_type})`);
    }
    return node.obj_token;
  }

  async readRange(spreadsheetToken, sheetId, range = "A:ZZ") {
    const res = await this.client.get(
      `/sheets/v2/spreadsheets/${spreadsheetToken}/values_batch_get`,
      { ranges: `${sheetId}!${range}`, valueRenderOption: "ToString" }
    );
    return res?.data?.valueRanges?.[0]?.values ?? [];
  }
}
