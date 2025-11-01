import { cors } from "hono/cors";

class CorsService {
  static createCorsConfig() {
    return cors({
      origin: (origin, c) => {
        return CorsService.validateOrigin(origin, c);
      },
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    });
  }

  static validateOrigin(origin, c) {
    const corsOrigins = c.env.CORS_ORIGINS?.split(",") || [];

    // Direct match
    if (corsOrigins.includes(origin)) {
      return origin;
    }

    // Handle wildcard domains, eg: *.jemmia.vn
    const wildcardOrigins = corsOrigins.filter((o) =>
      o.startsWith("https://*.")
    );

    for (const wildcardOrigin of wildcardOrigins) {
      const baseDomain = wildcardOrigin.replace("https://*.", "");

      // Allow both wildcard subdomains and the base domain itself
      if (
        origin.endsWith(`.${baseDomain}`) ||
        origin === `https://${baseDomain}`
      ) {
        return origin;
      }
    }

    return null;
  }
}

export default CorsService;
