import orderService from "../services/jemmia_erp/order";

export default {
    queue : async (batch, env) => {
        const environment = env.ENV === "dev" ? "-dev" : "";
        switch (batch.queue) {
            case `order${environment}`:
                await orderService.decodeOrderQueue(batch, env);
                break;
            default:
                break;
        }
    }
}
