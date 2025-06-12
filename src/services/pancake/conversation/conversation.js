import Database from "../../database";

export default class ConversationService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(this.env);
  }

  async getConversationsToSyncLead(offset, batch_size, updated_time) {
    try {
      let conversations = await this.db.$queryRaw`WITH base_conversations AS (
                SELECT c.id, c.page_id, c.customer_id, c.type, c.inserted_at, c.updated_at,
                    c.has_phone, c.database_updated_at, c.last_sent_at, c.added_user_id
                FROM pancake.conversation c 
                WHERE c.inserted_at >= '2025-05-01 00:00:00' AND c.updated_at >= '2025-06-011 00:00:00'
                ORDER BY c.database_updated_at DESC
                LIMIT ${batch_size} OFFSET ${offset}
            ),
            conversation_tags AS (
                SELECT 
                    ct.*,
                    ROW_NUMBER() OVER (PARTITION BY conversation_id, tag_page_id ORDER BY database_updated_at DESC) AS rn
                FROM pancake.conversation_tag ct
                WHERE ct.conversation_id IN (SELECT id FROM base_conversations)
            ),
            valid_tags AS (
                SELECT *
                FROM conversation_tags
                WHERE rn = 1 AND action = 'add'
            )
            SELECT 
                c.id as conversation_id,
                c.page_id,
                c.customer_id,
                c.type,
                c.inserted_at, 
                c.updated_at,
                c.has_phone,
                p.name as page_name,
                p.platform as platform,
                pc.name as customer_name,
                pc.phone as customer_phone,
                pc.gender as customer_gender,
                pc.birthday as customer_birthday,
                pc.phone_numbers as customer_phone_numbers,
                pc.lives_in as customer_lives_in,
                pc.can_inbox as can_inbox,
                flc.frappe_name_id as frappe_name_id, 
                array_remove(array_agg(vt.tag_label), NULL) as tags,
                c.last_sent_at as latest_message_at, 
                c.added_user_id as pancake_user_id
            FROM base_conversations c
            LEFT JOIN pancake.conversation_page_customer cpc ON c.id = cpc.conversation_id
            LEFT JOIN pancake.page_customer pc ON c.customer_id = pc.customer_id 
            LEFT JOIN pancake.page p ON p.id = c.page_id 
            LEFT JOIN pancake.frappe_lead_conversation flc ON c.id = flc.conversation_id 
            LEFT JOIN valid_tags vt ON c.id = vt.conversation_id 
            WHERE EXISTS (
                SELECT 1 
                FROM valid_tags vt2
                WHERE vt2.conversation_id = c.id 
                AND (
                    vt2.tag_label IN ('Lead Lạnh', 'Lead Ấm', 'Lead Nóng')
                    OR 
                    (
                        EXISTS (
                            SELECT 1 
                            FROM valid_tags vt_demand
                            WHERE vt_demand.conversation_id = c.id 
                            AND vt_demand.tag_label IN (
                                'NC Cưới', 'NC Khiếu nại', 'NC TMTĐ', 'NC Cầu hôn',
                                'NC Tặng', 'NC Bản thân', 'NC >6.3 Ly', 'NC Mã cạnh đẹp'
                            )
                        )
                        AND 
                        EXISTS (
                            SELECT 1 
                            FROM valid_tags vt_price
                            WHERE vt_price.conversation_id = c.id 
                            AND vt_price.tag_label IN (
                                '<15 TRIỆU', '15-30 TRIỆU', '30-50 TRIỆU', '50-80 TRIỆU',
                                '80-120 TRIỆU', '120-200 TRIỆU', '200-300 TRIỆU', 
                                '300-500 TRIỆU', '500-800 TRIỆU', '800 TRIỆU - 1 TỶ', '>1 TỶ'
                            )
                        )
                    )
                )
            )
            GROUP BY 
                c.id, c.page_id, c.customer_id, c.type, c.inserted_at, c.updated_at, c.has_phone, 
                pc.name, pc.phone, pc.gender, pc.birthday, pc.phone_numbers, pc.lives_in, pc.can_inbox,
                flc.frappe_name_id, c.database_updated_at, p.platform, c.last_sent_at, p.name, c.added_user_id
            ORDER BY c.database_updated_at DESC `;

      return conversations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async getBaseCount(updatedTime) {
    try {
      const [{ total_count }] = await this.db.$queryRaw`
            SELECT COUNT(*) AS total_count
            FROM pancake.conversation c
            WHERE c.inserted_at >= '2025-05-01 00:00:00'
            AND c.updated_at >= ${updatedTime}
        `;
      return total_count;
    } catch (err) {
      console.error("Error fetching lead count:", err.message);
      return 0;
    }
  }

  async saveSyncedLeadsBatch(trackingConversations) {
    if (
      !Array.isArray(trackingConversations) ||
      trackingConversations.length === 0
    )
      return;

    const values = trackingConversations
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
      .join(", ");

    const flatValues = trackingConversations.flatMap((lead) => [
      lead.conversationId,
      lead.frappeNameId
    ]);

    const query = `
      INSERT INTO pancake.frappe_lead_conversation (conversation_id, frappe_name_id)
      VALUES ${values}
      ON CONFLICT (conversation_id)
      DO UPDATE SET frappe_name_id = EXCLUDED.frappe_name_id
    `;

    try {
      const result = await this.db.$transaction([
        this.db.$executeRawUnsafe(query, ...flatValues)
      ]);
      return result;
    } catch (err) {
      console.error("[saveSyncedLeadsBatch] Transaction failed:", err);
      throw err;
    }
  }
}
