import BaseWorkplaceClient from "services/clients/workplace-client/base-client";

export default class DesignsClient extends BaseWorkplaceClient {
  constructor(api, baseId) {
    super(api, baseId, "designs");
  }

  async getByDesignCode(designCode) {
    return await this.findOne({ where: `(design_code,eq,${designCode})` });
  }

  async getByErpCode(erpCode) {
    return await this.findOne({ where: `(erp_code,eq,${erpCode})` });
  }

  async getByCode(code) {
    return await this.findOne({ where: `(code,eq,${code})` });
  }
}
