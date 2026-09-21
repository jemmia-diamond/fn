import { sign, verify } from "hono/jwt";
import KocAffiliateService from "services/koc/koc-affiliate-service";

const DEFAULT_SECRET = "jemmia-koc-affiliate-secret-2026";
const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

export default class KocAuthController {
  static getSecret(env) {
    return env.KOC_JWT_SECRET || env.JWT_SECRET || DEFAULT_SECRET;
  }

  static async generateToken(env, koc) {
    const payload = {
      kocId: koc.id,
      name: koc.name,
      kocDocname: koc.koc_docname,
      exp: Math.floor(Date.now() / 1000) + SEVEN_DAYS_IN_SECONDS
    };

    return sign(payload, KocAuthController.getSecret(env));
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

    const res = await new KocAffiliateService(c.env).verifyLogin(
      username,
      password
    );

    if (!res || !res.authenticated) {
      return KocAuthController.unauthorized(
        c,
        res?.message || "Đăng nhập thất bại"
      );
    }

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
