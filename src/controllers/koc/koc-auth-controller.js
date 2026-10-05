import { sign, verify } from "hono/jwt";
import KocAffiliateService from "services/koc/koc-affiliate-service";

const EIGHT_HOURS_IN_SECONDS = 8 * 60 * 60;

export default class KocAuthController {
  static getSecret(env) {
    const secret = env.KOC_JWT_SECRET || env.JWT_SECRET;
    if (!secret) {
      throw new Error("Missing KOC_JWT_SECRET environment variable");
    }
    return secret;
  }

  static async generateToken(env, koc) {
    const payload = {
      kocId: koc.id,
      name: koc.name,
      kocDocname: koc.koc_docname,
      exp: Math.floor(Date.now() / 1000) + EIGHT_HOURS_IN_SECONDS
    };

    return sign(payload, KocAuthController.getSecret(env));
  }

  static async checkRateLimit(c, identifier) {
    const kv = c.env?.FN_KV;
    if (!kv) return true;

    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for") ||
      "unknown";
    const key = `koc_login_attempts:${identifier || ip}`;
    const attempts = parseInt((await kv.get(key)) || "0", 10);

    if (attempts >= 5) {
      return false;
    }

    await kv.put(key, String(attempts + 1), { expirationTtl: 15 * 60 });
    return true;
  }

  static async resetRateLimit(c, identifier) {
    const kv = c.env?.FN_KV;
    if (!kv) return;

    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for") ||
      "unknown";
    const key = `koc_login_attempts:${identifier || ip}`;
    await kv.delete(key);
  }

  static async create(c) {
    const { username, password } = await c.req.json();

    if (!username) {
      return c.json(
        {
          error: "missing_identifier",
          message: "Missing Identifier",
          full_message: "Vui lòng nhập tên đăng nhập"
        },
        400
      );
    }

    const isAllowed = await KocAuthController.checkRateLimit(c, username);
    if (!isAllowed) {
      return c.json(
        {
          error: "too_many_requests",
          message: "Too Many Requests",
          full_message:
            "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút."
        },
        429
      );
    }

    const res = await new KocAffiliateService(c.env).verifyLogin(
      username,
      password
    );

    if (!res || !res.authenticated) {
      return KocAuthController.unauthorized(
        c,
        "Tên đăng nhập hoặc mật khẩu không chính xác"
      );
    }

    await KocAuthController.resetRateLimit(c, username);

    const token = await KocAuthController.generateToken(c.env, res.koc);

    return c.json({
      token,
      koc: {
        id: res.koc.id,
        name: res.koc.name,
        kocDocname: res.koc.koc_docname,
        phone: res.koc.phone,
        attributionWindowDays: res.koc.attribution_window_days,
        commissionRate: res.koc.commission_rate
      }
    });
  }

  static async show(c) {
    const koc = c.get("koc");
    return c.json({
      id: koc.kocId,
      name: koc.name,
      kocDocname: koc.kocDocname
    });
  }

  static unauthorized(c, fullMessage) {
    return c.json(
      {
        error: "unauthorized",
        message: "Not Authorized",
        full_message: fullMessage
      },
      401
    );
  }

  static async requireAuth(c, next) {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return KocAuthController.unauthorized(
        c,
        "Token xác thực không hợp lệ hoặc thiếu"
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const secret = KocAuthController.getSecret(c.env);

    let payload;
    try {
      payload = await verify(token, secret, "HS256");
    } catch {
      return KocAuthController.unauthorized(
        c,
        "Token đã hết hạn hoặc không hợp lệ"
      );
    }

    if (!payload || !payload.kocId) {
      return KocAuthController.unauthorized(c, "Payload token không hợp lệ");
    }

    c.set("koc", payload);
    await next();
  }
}
