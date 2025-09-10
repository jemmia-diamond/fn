import Larksuite from "services/larksuite";
import ERP from "services/erp";
import Ecommerce from "services/ecommerce";
import InventoryCMS from "services/inventory-cms";
import DatabaseOperations from "services/db-operations";
import ProductQuote from "services/product_quote";

export default {
  scheduled: async (controller, env, _ctx) => {
    switch (controller.cron) {
    case "0 * * * *": // At minute 0 every hour
      await ERP.CRM.LeadService.syncWebsiteLeads(env);
      await ERP.Telephony.CallLogService.syncStringeeCallLogs(env);
      await ERP.CRM.LeadService.syncCallLogLead(env);
      await ERP.Selling.SalesOrderService.fillSalesOrderRealDate(env);
      await ERP.Selling.SalesOrderService.fillSerialNumbersToTemporaryOrderItems(env);
      break;
    case "*/10 * * * *": // At every 10th minute
      await ERP.Selling.SerialService.syncSerialsToERP(env);
      await ERP.CRM.LeadService.cronSyncLeadsToDatabase(env);
      break;
    case "*/15 * * * *": // At every 15th minute
      await ERP.Contacts.ContactService.cronSyncContactsToDatabase(env);
      break;
    case "*/20 * * * *": // At every 20th minute
      await ERP.Selling.SalesOrderService.cronSyncSalesOrdersToDatabase(env);
      await ERP.Selling.CustomerService.cronSyncCustomersToDatabase(env);
      await DatabaseOperations.MaterializedViewService.refresh20Minutes(env);
      break;
    case "*/30 * * * *": // At every 30th minute
      await ERP.Contacts.AddressService.cronSyncAddressesToDatabase(env);
      await Ecommerce.ProductService.refreshMaterializedViews(env);
      await DatabaseOperations.MaterializedViewService.refresh30Minutes(env);
      break;
    case "0 */3 * * *": // At every 3rd hour
      await InventoryCMS.InventoryCheckSheetService.syncInventoryCheckSheetToDatabase(env);
      await InventoryCMS.InventoryCheckLineService.syncInventoryCheckLineToDatabase(env);
    case "0 17 * * *": // 00:00
      await Larksuite.Contact.UserService.syncUsersToDatabase(env);
      await ERP.Core.UserService.syncLarkIds(env);
      await ERP.Core.UserService.syncUsersToDatabase(env);
      await ERP.Setup.EmployeeService.syncEmployeesToDatabase(env);
      await ERP.Selling.SalesPersonService.syncSalesPersonToDatabase(env);
      await Larksuite.Docs.Base.RecordService.syncRecordsToDatabase(env);
      break;
    case "30 0 * * *": // 07:30
      await ERP.CRM.LeadDemandService.syncLeadDemandToDatabase(env);
      await ERP.CRM.LeadBudgetService.syncLeadBudgetsToDatabase(env);
      await ERP.CRM.RegionService.syncRegionsToDatabase(env);
      await ERP.CRM.ProvinceService.syncProvincesToDatabase(env);
      await ERP.Selling.PurchasePurposeService.syncPurchasePurposeToDatabase(env);
      await ERP.Selling.ProductCategoryService.syncProductCategoryToDatabase(env);
      await ERP.Selling.PromotionService.syncPromotionToDatabase(env);
      break;
    case "0 1 * * *": // 08:00
      await Larksuite.Attendance.ScheduleService.syncScheduleToDatabase(env);
      await Larksuite.Approval.InstanceService.syncInstancesToDatabase(env);
      break;
    case "30 1 * * *": // 08:30
      await ERP.Automation.AssignmentRuleService.disableAssignmentRuleOffHour(env);
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesStartDay(env);
      await ERP.Automation.AssignmentRuleService.reAssignOffHourLeads(env);
      break;
    case "30 5 * * *": // 12:30
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesMidDay(env);
      break;
    case "0 10 * * *": // 17:00
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesEndDay(env);
      break;
    case "0 14 * * *": // 21:00
      await ERP.Automation.AssignmentRuleService.enableAssignmentRuleOffHour(env);
      break;
    case "*/5 * * * *": // At every 5 minutes
      await ProductQuote.ProductQuoteRemindReorderService.remindReorderOnHandTempProduct(env);
      break;
    default:
      break;
    };
  }
};
