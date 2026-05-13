import { ONE_OFF_SCRIPTS } from "src/one-off/index";

const KV_TTL_SECONDS = 365 * 24 * 60 * 60;
const LOCK_TTL_SECONDS = 3 * 60 * 60;

export default class OneOffHandler {
  constructor(private env: any) {}

  async run(): Promise<void> {
    for (const { name, handler } of ONE_OFF_SCRIPTS) {
      const status = await this.env.FN_KV.get(`one-off:${name}`);
      if (status) continue;
      await this.env.FN_KV.put(`one-off:${name}`, "running", { expirationTtl: LOCK_TTL_SECONDS });
      await handler(this.env);
      await this.env.FN_KV.put(`one-off:${name}`, "done", { expirationTtl: KV_TTL_SECONDS });
    }
  }
}
