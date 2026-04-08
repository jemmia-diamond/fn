import LarksuiteService from "services/larksuite/lark";

export default class DocxService {
  static async getRawContent(env, documentId) {
    const larkClient = await LarksuiteService.createClientV2(env);

    const response = await larkClient.docx.document.getRawContent({
      path: {
        document_id: documentId
      },
      params: {
        lang: 0
      }
    });

    if (response?.code !== 0) {
      throw new Error(`Lark Docx Raw Content API error: ${response.msg || "Unknown error"} (code: ${response.code})`);
    }

    return response.data;
  }
}
