import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import ShieldMessageService from "services/jemmia-shield/shield-message-service";
import AppointmentService from "services/larksuite/appointment/appointment-service";
import Approval from "services/larksuite/approval";
import Attendance from "services/larksuite/attendance";
import BuybackExchangeService from "services/larksuite/buyback-exchange-service";
import Contact from "services/larksuite/contact";
import Docs from "services/larksuite/docs";
import LarksuiteService from "services/larksuite/lark";
import Messaging from "services/larksuite/messaging";
import SerialSyncService from "services/larksuite/serial/serial-sync-service";
import Ticket from "services/larksuite/tech-ticket";
import VariantSyncService from "services/larksuite/variant/variant-sync-service";

export default {
  AppointmentService,
  Contact: Contact,
  Attendance: Attendance,
  LarksuiteService: LarksuiteService,
  Approval: Approval,
  Docs: Docs,
  Messaging: Messaging,
  BuybackExchangeService,
  Ticket,
  ShieldMessageService,
  JemmiaShieldLarkService,
  SerialSyncService,
  VariantSyncService
};
