import LeadService from "services/erp/crm/lead/lead";
import PancakeLeadSyncService from "services/erp/crm/lead/pancake-lead-sync";
import LeadDemandService from "services/erp/crm/lead_demand/lead_demand";
import LeadBudgetService from "services/erp/crm/lead_budget/lead_budget";
import LeadProductService from "services/erp/crm/lead_product/lead_product";
import RegionService from "services/erp/crm/region/region";
import ProvinceService from "services/erp/crm/province/province";

export default {
  LeadService: LeadService,
  PancakeLeadSyncService: PancakeLeadSyncService,
  LeadDemandService: LeadDemandService,
  LeadBudgetService: LeadBudgetService,
  LeadProductService: LeadProductService,
  RegionService: RegionService,
  ProvinceService: ProvinceService
};
