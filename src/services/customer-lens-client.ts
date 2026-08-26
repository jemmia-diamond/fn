import { createAxiosClient, DEFAULT_RETRY_CONFIG } from "services/utils/http-client";

class CustomerLensClient {
  static createClient(env: any) {
    return createAxiosClient(
      {
        baseURL: env.CUSTOMER_LENS_URL,
        headers: {
          "Content-Type": "application/json",
          "auth-token": env.CUSTOMER_LENS_AUTH_TOKEN
        }
      },
      { ...DEFAULT_RETRY_CONFIG }
    );
  }

  static instance(env: any) {
    return CustomerLensClient.createClient(env);
  }
}

export default CustomerLensClient;
