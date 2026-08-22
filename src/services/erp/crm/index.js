import AppointmentService from "services/erp/crm/appointment/appointment";
import CRMService from "services/erp/crm/crm-service";
import LeadService from "services/erp/crm/lead/lead";
import PancakeLeadSyncService from "services/erp/crm/lead/pancake-lead-sync";
import LeadBudgetService from "services/erp/crm/lead_budget/lead_budget";
import LeadDemandService from "services/erp/crm/lead_demand/lead_demand";
import LeadProductService from "services/erp/crm/lead_product/lead_product";
import ProvinceService from "services/erp/crm/province/province";
import RegionService from "services/erp/crm/region/region";

export default {
  LeadService: LeadService,
  PancakeLeadSyncService: PancakeLeadSyncService,
  LeadDemandService: LeadDemandService,
  LeadBudgetService: LeadBudgetService,
  LeadProductService: LeadProductService,
  RegionService: RegionService,
  ProvinceService: ProvinceService,
  CRMService: CRMService,
  AppointmentService
};
