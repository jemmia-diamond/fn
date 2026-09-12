import FormData from "form-data";
import GoogleDriveClient from "services/clients/google-drive-client";
import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

const NOCODB_BASE_ID = "pbzopuiobhc8xf1";
const RETOUCH_COLUMN_ID = "cq2ja2kexb2aayk";

const COLOR_MAP = {
  "vàng trắng": "VT",
  "vàng hồng": "VH",
  "vàng vàng": "VV",
  "vàng trắng - vàng hồng": "VT-VH",
  "vàng trắng - vàng vàng": "VT-VV",
  "vàng hồng - vàng vàng": "VH-VV"
};

function colorMapping(color) {
  if (!color) return null;
  return COLOR_MAP[color.toLowerCase()] || null;
}

function extractFolderIdFromLink(link) {
  if (!link) return "";
  let cleaned = link.trim().split("?")[0];
  if (cleaned.includes("drive.google.com")) {
    if (cleaned.includes("/folders/")) {
      cleaned = cleaned.split("/folders/")[1];
    } else if (cleaned.includes("/file/d/")) {
      cleaned = cleaned.split("/file/d/")[1];
    } else {
      cleaned = cleaned.replace(/\/+$/, "").split("/").pop();
    }
  } else {
    cleaned = cleaned.replace(/\/+$/, "").split("/").pop();
  }
  cleaned = cleaned.split("/")[0];
  cleaned = cleaned.replace(/%0D/g, "").replace(/%0A/g, "");
  return cleaned.trim().replace(/\/+$/, "").trim();
}

function findSubFolder(items, targetName) {
  return items.find(
    (item) =>
      item.name.replace(/ /g, "") === targetName &&
      item.mimeType === "application/vnd.google-apps.folder"
  );
}

export default class RetouchUploaderService {
  constructor(env) {
    this.env = env;
  }

  async handle(payload) {
    const data = payload?.data?.rows?.[0];
    const tableId = payload?.data?.table_id;

    if (tableId !== NOCODB_TABLES.MARKETING.DESIGN_IMAGES) {
      throw new Error(`Ignored table ID: ${tableId}`);
    }

    if (!data) {
      throw new Error("No data found in payload");
    }

    if (data.retouch != null) {
      return { skipped: true, reason: "retouch already exists" };
    }

    const materialColor = data.material_color;
    if (!materialColor) {
      throw new Error("material_color is missing");
    }

    const subFolderName = colorMapping(materialColor);
    if (!subFolderName) {
      throw new Error(`Unknown material color: ${materialColor}`);
    }

    const driveClient = new GoogleDriveClient(
      this.env.GOOGLE_SERVICE_ACCOUNT_KEY
    );
    const nocoClient = new NocoDBClient(this.env);

    // Try link_retouch first, fallback to link_render
    const linkRetouch = data.link_retouch;
    if (linkRetouch) {
      const folderId = extractFolderIdFromLink(linkRetouch);
      const uploaded = await this.#uploadImagesFromDrive(
        driveClient,
        nocoClient,
        folderId,
        subFolderName,
        tableId,
        data.id
      );
      if (uploaded) return { success: true, source: "link_retouch" };
    }

    const linkRender = data.link_render;
    const folderId = extractFolderIdFromLink(linkRender);
    await this.#uploadImagesFromDrive(
      driveClient,
      nocoClient,
      folderId,
      subFolderName,
      tableId,
      data.id
    );

    return { success: true, source: "link_render" };
  }

  async #uploadImagesFromDrive(
    driveClient,
    nocoClient,
    folderId,
    subFolderName,
    tableId,
    recordId
  ) {
    const items = await this.#findRetouchImages(
      driveClient,
      folderId,
      subFolderName
    );

    if (items.length <= 1) return false;

    // Ensure file names have extensions
    for (const item of items) {
      if (!item.name.includes(".")) {
        if (item.mimeType === "image/png") item.name += ".png";
        else if (item.mimeType === "image/jpeg") item.name += ".jpg";
      }
    }

    // Download and upload each file
    const uploadedFiles = [];
    const storagePath = `noco/${NOCODB_BASE_ID}/${tableId}/${RETOUCH_COLUMN_ID}`;

    for (const item of items) {
      try {
        const fileData = await driveClient.downloadFile(item.id);
        const form = new FormData();
        form.append("file", Buffer.from(fileData), {
          filename: item.name,
          contentType: item.mimeType
        });

        const res = await nocoClient.uploadAttachment(
          { path: storagePath },
          form
        );
        if (Array.isArray(res) && res.length > 0) {
          const uploadedFile = res[0];
          uploadedFile.title = item.name;
          uploadedFiles.push(uploadedFile);
        }
      } catch (error) {
        console.warn(`Failed to process file ${item.name}: ${error.message}`);
      }
    }

    if (uploadedFiles.length === 0) return false;

    // Update the record's retouch attachment field
    await nocoClient.updateRecords(tableId, {
      id: recordId,
      retouch: uploadedFiles
    });

    return true;
  }

  async #findRetouchImages(driveClient, folderId, subFolderName) {
    const rootItems = await driveClient.listFiles(folderId);

    // Try to find color subfolder first
    const subFolder = findSubFolder(rootItems, subFolderName);
    let foundItems = [];

    if (subFolder) {
      const subItems = await driveClient.listFiles(subFolder.id);
      foundItems = subItems.filter((i) => i.mimeType === "image/png");
      if (foundItems.length === 0) {
        foundItems = subItems.filter((i) => i.mimeType === "image/jpeg");
      }
    }

    // Fallback to root folder images
    if (foundItems.length === 0) {
      foundItems = rootItems.filter((i) => i.mimeType === "image/png");
      if (foundItems.length === 0) {
        foundItems = rootItems.filter((i) => i.mimeType === "image/jpeg");
      }
    }

    foundItems.sort((a, b) => a.name.localeCompare(b.name));
    return foundItems;
  }
}
