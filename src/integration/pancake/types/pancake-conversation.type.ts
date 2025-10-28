export interface PancakeConversationAddedUser {
  id?: string;
  name?: string;
  email?: string;
  fb_id?: string;
}

export interface PancakeConversationItem {
  id: string;
  page_id: string;
  customer_id: string;
  conversation_id: string;
  type: string;
  inserted_at: Date;
  updated_at: Date;
  has_phone: boolean;
  post_id: string;
  assignee_histories: {
    payload: {
      added_users: PancakeConversationAddedUser[];
    };
    timestamp: string | Date;
    action?: string;
  }[];
  customers?: {
    id: string;
    avatar_url: string;
  }[];
  tag_histories: {
    payload: {
      tag: {
        id: number;
        label?: string;
        description?: string;
      },
      inserted_at: Date;
      action: string;
    };
    timestamp: string | Date;
    action?: string;
  }[];
}
