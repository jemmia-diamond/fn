export default class DocxService {
  static async getRawContent({ larkClient, documentId }) {
    const response = await larkClient.docx.document.rawContent({
      path: {
        document_id: documentId
      },
      params: {
        lang: 0
      }
    });

    if (response?.code !== 0) {
      throw new Error(
        `Lark Docx Raw Content API error: ${response.msg || "Unknown error"} (code: ${response.code})`
      );
    }

    return response.data;
  }
}
