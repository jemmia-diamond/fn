import { IFrapperAttachment } from "services/larksuite/appointment/types";
import FrappeClient from "./frappe-client";

export async function removeFileAttachment(
  frappeClient: FrappeClient,
  attachments: IFrapperAttachment[]
) {
  if (!attachments?.length) {
    return;
  }

  try {
    await Promise.all(
      attachments.map(async (attachment) => {
        await frappeClient.deleteDoc("File", attachment.name);
      })
    );
  } catch (error) {
    console.warn("Error removing file attachments:", error);
  }
}

export async function getDocumentAttachments(
  frappeClient: FrappeClient,
  doctype: string,
  docname: string
): Promise<IFrapperAttachment[]> {
  try {
    const attachments = await frappeClient.getList("File", {
      fields: ["name", "file_name", "file_url", "is_private"],
      filters: {
        attached_to_doctype: doctype,
        attached_to_name: docname
      }
    });
    return attachments || [];
  } catch (error) {
    console.warn(
      `Error fetching attachments for ${doctype} ${docname}:`,
      error
    );
    return [];
  }
}
