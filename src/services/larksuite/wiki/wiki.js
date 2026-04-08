import LarksuiteService from "services/larksuite/lark";

export default class WikiService {
  static async listSpaces(env) {
    const larkClient = await LarksuiteService.createClientV2(env);
    const responses = await LarksuiteService.requestWithPagination(
      larkClient.wiki.space.list,
      {},
      50
    );

    return responses.flatMap(res => res?.data?.items ?? []);
  }

  static async listNodes(env, spaceId) {
    const larkClient = await LarksuiteService.createClientV2(env);
    const responses = await LarksuiteService.requestWithPagination(
      larkClient.wiki.spaceNode.list,
      {
        path: {
          space_id: spaceId
        }
      },
      50
    );

    return responses.flatMap(res => res?.data?.items ?? []);
  }
}
