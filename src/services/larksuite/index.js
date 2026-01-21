import Contact from "services/larksuite/contact";
import Attendance from "services/larksuite/attendance";
import LarksuiteService from "services/larksuite/lark";
import Approval from "services/larksuite/approval";
import Docs from "services/larksuite/docs";
import Messaging from "services/larksuite/messaging";
import BuybackExchangeService from "services/larksuite/buyback-exchange-service";
import Ticket from "services/larksuite/tech-ticket";
import RecallMessageService from "services/larksuite/recall-message.service";
import RecallLarkService from "services/larksuite/recall-lark.service";

export default {
  Contact: Contact,
  Attendance: Attendance,
  LarksuiteService: LarksuiteService,
  Approval: Approval,
  Docs: Docs,
  Messaging: Messaging,
  BuybackExchangeService,
  Ticket,
  RecallMessageService,
  RecallLarkService
};
