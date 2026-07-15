import { createAxiosClient } from "services/utils/http-client";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;

export default class VbotClient {
  constructor(env) {
    this.client = createAxiosClient({
      baseURL: env.VBOT_BASE_URL,
      headers: { "X-API-KEY": env.CC_API_KEY }
    });
  }

  async getRequest(path, params = {}) {
    const res = await this.client.get(path, { params });

    if (res.data.error !== 0) {
      throw new Error(`Vbot API error: ${res.data.message}`);
    }

    return res.data.data;
  }

  async getCallLogs(params = {}) {
    const defaultParams = { page: DEFAULT_PAGE, size: DEFAULT_PAGE_SIZE, ...params };
    return await this.getRequest("/api/crm/historycall/getAll", defaultParams);
  }

  async getMemberByMemberNo(memberNo) {
    return await this.getRequest("/api/member/getByMemberNo", { member_no: memberNo });
  }
}
