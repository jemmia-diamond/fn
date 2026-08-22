import ConversationService from "services/pancake/conversation/conversation";
import ConversationAssignmentService from "services/pancake/conversation-assigment/conversation-assignment";
import { PancakePOSShopSyncService } from "services/pancake/pos/index";
import PancakePOSSyncService from "services/pancake/pos/pancake-pos-sync-service";
import ConversationSyncService from "services/pancake/sync/conversation-sync-service";
import CustomerSyncService from "services/pancake/sync/customer-sync-service";
import PageSyncService from "services/pancake/sync/page-sync-service";
import TagSyncService from "services/pancake/sync/tag-sync-service";
import TokenRefresherService from "services/pancake/sync/token-refresher-service";

export default {
  ConversationAssignmentService,
  ConversationService,
  ConversationSyncService,
  PageSyncService,
  CustomerSyncService,
  TagSyncService,
  TokenRefresherService,
  PancakePOSShopSyncService,
  PancakePOSSyncService
};
