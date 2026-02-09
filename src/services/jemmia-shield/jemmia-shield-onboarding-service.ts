import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";

export default class JemmiaShieldOnboardingService {
  static async getGroupSelectionData(env: any, code: string) {
    const tokenData = await JemmiaShieldLarkService.getUserAccessToken(
      env,
      code
    );
    const accessToken = tokenData.access_token;

    const userInfo = await JemmiaShieldLarkService.getUserInfo(
      env,
      accessToken
    );
    const userId = userInfo.user_id || userInfo.open_id;
    const openId = userInfo.open_id;

    const allGroups = await JemmiaShieldLarkService.getUserGroups(
      env,
      accessToken
    );

    const ownedGroups = allGroups.filter(
      (group: any) => group.owner_id === userId || group.owner_id === openId
    );

    const botGroups = await JemmiaShieldLarkService.getBotGroups(env);
    const botGroupIds = new Set(botGroups.map((g: any) => g.chat_id));

    return {
      userInfo,
      ownedGroups,
      botGroupIds,
      accessToken
    };
  }
}
