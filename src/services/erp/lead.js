import FrappeClient from '../../frappe/frappe-client';

export default class LeadService {
    constructor(env) {
        this.env = env;
        this.frappeClient = new FrappeClient(
            {
                url: env.JEMMIA_ERP_BASE_URL,
                apiKey: env.JEMMIA_ERP_API_KEY,
                apiSecret: env.JEMMIA_ERP_API_SECRET
            }
        );
    };

    async updateLeadInfoFromSummary(data, conversationId){
       let res = await this.frappeClient.updateLeadInfo({...data, 'conversation_id': conversationId})
    }
}