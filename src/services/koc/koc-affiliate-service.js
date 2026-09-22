import FrappeClient from "frappe/frappe-client";

export function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone || "";
  return phone.slice(0, 3) + "***" + phone.slice(-4);
}

export function maskName(fullName) {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0] + "***";
  return `${parts[0]} ***`;
}

export default class KocAffiliateService {
  constructor(env) {
    this.env = env;
    this.frappeClient = new FrappeClient({ env });
  }

  async verifyLogin(identifier, password) {
    const res = await this.frappeClient.postRequest("", {
      cmd: "erpnext.crm.doctype.koc.koc_service.verify_koc_login",
      identifier,
      password: password || ""
    });
    return res;
  }

  async getSessions(identifier) {
    const res = await this.frappeClient.postRequest("", {
      cmd: "erpnext.crm.doctype.koc.koc_service.get_koc_sessions",
      identifier
    });
    return res?.items || [];
  }

  async getDashboardStats(identifier, session_id = "") {
    const res = await this.frappeClient.postRequest("", {
      cmd: "erpnext.crm.doctype.koc.koc_service.get_koc_dashboard_stats",
      identifier,
      session_id
    });

    return {
      recordedLeads: res?.recorded_leads ?? 0,
      orderedLeads: res?.ordered_leads ?? 0,
      activeLeads: res?.active_leads ?? 0,
      activeWindowDays: res?.active_window_days ?? 45,
      totalOrderValue: res?.total_order_value ?? 0,
      commissionEarned: res?.commission_earned ?? 0,
      lastUpdated: res?.last_updated ?? null
    };
  }

  async getLeads(
    identifier,
    { session_id = "", page = 1, page_size = 10 } = {}
  ) {
    const res = await this.frappeClient.postRequest("", {
      cmd: "erpnext.crm.doctype.koc.koc_service.get_koc_leads",
      identifier,
      session_id,
      page,
      page_size
    });

    const items = (res?.items || []).map((lead) => ({
      id: lead.id,
      name: maskName(lead.lead_name),
      phone: maskPhone(lead.phone),
      session: lead.session_name,
      recordedAt: lead.recorded_at,
      updatedAt: lead.updated_at,
      status: {
        kind: lead.status?.kind,
        label: lead.status?.label,
        subLabel: lead.status?.sub_label
      },
      orderValue: lead.order_value,
      commissionRate: lead.commission_rate,
      commission: lead.commission
    }));

    return {
      items,
      total: res?.total ?? 0,
      page: res?.page ?? page,
      pageSize: res?.page_size ?? page_size
    };
  }
}
