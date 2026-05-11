import ConversationAssignmentService from "services/pancake/conversation-assigment/conversation-assignment";
import ConversationService from "services/pancake/conversation/conversation";
import ConversationSyncService from "services/pancake/sync/conversation-sync-service";
import PageSyncService from "services/pancake/sync/page-sync-service";
import CustomerSyncService from "services/pancake/sync/customer-sync-service";
import TagSyncService from "services/pancake/sync/tag-sync-service";
import { PancakePOSSyncService, PancakePOSShopSyncService } from "services/pancake/pos/index";

export default {
  ConversationAssignmentService,
  ConversationService,
  ConversationSyncService,
  PageSyncService,
  CustomerSyncService,
  TagSyncService,
  PancakePOSSyncService,
  PancakePOSShopSyncService,
};
