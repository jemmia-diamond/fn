import Larksuite from "services/larksuite";
import ERP from "services/erp";
import Ecommerce from "services/ecommerce";
import InventoryCMS from "services/inventory-cms";
import DatabaseOperations from "services/db-operations";
import Misa from "services/misa";
import ProductQuote from "services/product_quote";
import WorkshopOrderServices from "services/sync/lark-to-nocodb/workshop-orders";
import Reporting from "services/reporting";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { TIMEZONE_VIETNAM } from "src/constants";
import Google from "services/google";
import Salesaya from "services/salesaya";
import Pancake from "services/pancake";

dayjs.extend(utc);
dayjs.extend(timezone);

export default {
  scheduled: async (controller, env, _ctx) => {
    switch (controller.cron) {
    case "0 * * * *": // At minute 0 every hour
      await ERP.Telephony.CallLogService.syncStringeeCallLogs(env);
      await ERP.CRM.LeadService.syncCallLogLead(env);
      await ERP.Selling.SalesOrderService.fillSerialNumbersToTemporaryOrderItems(env);
      await new Pancake.TagSyncService(env).syncTags();
      break;
    case "*/5 * * * *": // At every 5th minute
      await new Ecommerce.JewelryDiamondPairService(env).processOutOfStockDiamonds();
      await new Misa.InventoryItemSyncService(env).syncInventoryItems();
      await new ERP.CRM.PancakeLeadSyncService(env).syncPancakeLeads();
      await new Pancake.ConversationSyncService(env).syncConversations();
      await new Pancake.CustomerSyncService(env).syncCustomers();
      break;
    case "*/10 * * * *": // At every 10th minute
      await ERP.Selling.SerialService.syncSerialsToERP(env);
      await ERP.CRM.LeadService.cronSyncLeadsToDatabase(env);
      await new ProductQuote.DesignCodeService(env).syncDesignCodeToLark();
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
      await DatabaseOperations.DatabaseFunctionService.runWorkplaceUpdateLastRfidScanTime(env);
      await WorkshopOrderServices.WorkshopOrderServices.cronJobSyncLarkToNocoDB(env);
      await DatabaseOperations.MaterializedViewService.refresh3Hours(env);
      break;
    case "0 */6 * * *": // At every 6th hour
      await DatabaseOperations.MaterializedViewService.refresh6Hours(env);
      break;
    case "0 17 * * *": // 00:00
      await new Reporting.UptimeReportSyncService(env).dailySync();
      await Larksuite.Contact.UserService.syncUsersToDatabase(env);
      await ERP.Core.UserService.syncLarkIds(env);
      await ERP.Core.UserService.syncUsersToDatabase(env);
      await ERP.Setup.EmployeeService.syncEmployeesToDatabase(env);
      await ERP.Selling.SalesPersonService.syncSalesPersonToDatabase(env);
      await Larksuite.Docs.Base.RecordService.syncRecordsToDatabase(env);
      await new Ecommerce.DiamondCollectService(env).syncDiamondsToCollects();
      await Salesaya.LarkChatSyncMediaService.syncMedia(env);
      await new Pancake.PageSyncService(env).syncPages();
      break;
    case "30 0 * * *": // 07:30
      await ERP.CRM.LeadDemandService.syncLeadDemandToDatabase(env);
      await ERP.CRM.LeadBudgetService.syncLeadBudgetsToDatabase(env);
      await ERP.CRM.LeadProductService.syncLeadProductToDatabase(env);
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
    case "30 6 * * *": // 13:30
      break;
    case "0 10 * * *": // 17:00
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesEndDay(env);
      await ERP.Accounting.BankTransactionService.notifyUnlinkedBankTransactions(env, {
        fromDate: dayjs().tz(TIMEZONE_VIETNAM).hour(9).minute(0).second(0).toISOString(),
        toDate: dayjs().tz(TIMEZONE_VIETNAM).hour(17).minute(0).second(0).toISOString()
      });
      await new ERP.Accounting.PaymentEntryNotificationService(env).runAfternoonBatch();
      break;
    case "0 11 * * *": // 18:00
      break;
    case "0 2 * * *": // 09:00
      await ERP.Accounting.BankTransactionService.notifyUnlinkedBankTransactions(env, {
        fromDate: dayjs().tz(TIMEZONE_VIETNAM).subtract(1, "day").hour(17).minute(0).second(0).toISOString(),
        toDate: dayjs().tz(TIMEZONE_VIETNAM).hour(9).minute(0).second(0).toISOString()
      });
      await Larksuite.Ticket.TechTicketService.syncTechTickets(env, { mode: "daily" });
      await new Google.GoogleMerchantProductSyncService(env).sync();
      await new ERP.Accounting.PaymentEntryNotificationService(env).runMorningBatch();
      break;
    case "0 14 * * *": // 21:00
      await ERP.Automation.AssignmentRuleService.enableAssignmentRuleOffHour(env);
      break;
    default:
      break;
    };
  }
};
