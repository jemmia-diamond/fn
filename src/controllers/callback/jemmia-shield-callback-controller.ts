import ShieldOnboardingService from "services/jemmia-shield/shield-onboarding-service";

export default class JemmiaShieldCallbackController {
  static async index(c: any) {
    const code = c.req.query("code");

    if (!code) {
      return c.text("No code provided", 400);
    }

    try {
      const html = await ShieldOnboardingService.renderOnboardingPage(
        c.env,
        code
      );
      return c.html(html);
    } catch (error: any) {
      console.warn("Authentication Failed:", error);
      return c.text(
        `Authentication Failed: ${error.message}\n\nStack: ${error.stack}`,
        500
      );
    }
  }
}
