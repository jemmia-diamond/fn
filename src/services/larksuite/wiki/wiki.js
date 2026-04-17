import LarksuiteService from "services/larksuite/lark";

export default class WikiService {
  static async listSpaces({ larkClient }) {
    const responses = await LarksuiteService.requestWithPagination(
      larkClient.wiki.space.list.bind(larkClient.wiki.space),
      {},
      50
    );

    return responses.flatMap((res) => res?.data?.items ?? []);
  }

  static async listNodes({ larkClient, spaceId, parentNodeToken }) {
    const params = {
      page_size: 50
    };

    if (parentNodeToken) {
      params.parent_node_token = parentNodeToken;
    }

    const responses = await LarksuiteService.requestWithPagination(
      larkClient.wiki.spaceNode.list.bind(larkClient.wiki.spaceNode),
      {
        path: {
          space_id: spaceId
        },
        params
      },
      50
    );

    return responses.flatMap((res) => res?.data?.items ?? []);
  }

  static async getNode({ larkClient, nodeToken }) {
    const res = await larkClient.wiki.space.getNode({
      params: {
        token: nodeToken
      }
    });

    if (res.code !== 0) {
      throw new Error(
        `Lark Wiki Get Node error: ${res.msg} (code: ${res.code})`
      );
    }

    return res.data?.node;
  }
}
