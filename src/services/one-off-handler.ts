import { ONE_OFF_SCRIPTS } from "src/one-off/index";

const KV_TTL_SECONDS = 365 * 24 * 60 * 60;

export default class OneOffHandler {
  constructor(private env: any) {}

  async run(): Promise<void> {
    for (const { name, handler } of ONE_OFF_SCRIPTS) {
      const isDone = await this.env.FN_KV.get(`one-off:${name}`);
      if (isDone) continue;
      await handler(this.env);
      await this.env.FN_KV.put(`one-off:${name}`, "done", { expirationTtl: KV_TTL_SECONDS });
    }
  }
}
