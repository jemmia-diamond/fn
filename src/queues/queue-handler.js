import orderService from "../services/jemmia_erp/order";

export default {
    queue : async (batch, env) => {
        switch (batch.queue) {
            case "order":
                await orderService.decodeOrderQueue(batch, env);
                break;
            default:
                break;
        }
    }
}
