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
    const attempts = [];

    for (const [source, link] of [
      ["link_retouch", data.link_retouch],
      ["link_render", data.link_render]
    ]) {
      if (!link) continue;

      const result = await this.#uploadImagesFromDrive(
        driveClient,
        nocoClient,
        extractFolderIdFromLink(link),
        subFolderName,
        tableId,
        data.id
      );
      if (result.ok) return { success: true, source };
      attempts.push({ source, ...result });
    }

    // Nothing made it into `retouch`; reporting success here would send the
    // operator on to "Sync to Haravan" against an empty row.
    const describe = (a) => {
      if (a.errors.length)
        return `${a.source}: ${a.found} found, ${a.errors[0]}`;
      // Drive returns an empty listing for a folder the service account
      // cannot see, so "none found" and "no access" are indistinguishable here.
      if (a.found === 0)
        return `${a.source}: no ${subFolderName} images found (folder empty, missing, or not shared with the service account)`;
      return `${a.source}: only ${a.found} ${subFolderName} image(s) found, needs more than 1`;
    };
    const detail = attempts.length
      ? attempts.map(describe).join("; ")
      : "row has neither link_retouch nor link_render";

    return {
      success: false,
      reason: `design_images ${data.id}: ${detail}`
    };
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

    // `<= 1` (not `=== 0`) is carried over verbatim from the lambda, where it
    // had no stated rationale; a one-image folder therefore uploads nothing.
    // Left as-is for faithfulness — no such folder has been observed, and the
    // bail is now reported rather than silent.
    if (items.length <= 1)
      return { ok: false, found: items.length, errors: [] };

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

    const errors = [];

    for (const item of items) {
      try {
        const fileData = await driveClient.downloadFile(item.id);
        const form = new FormData();
        // Platform FormData: the filename is the 3rd argument, and the part's
        // own Content-Type comes from the Blob — an options object is ignored.
        form.append(
          "file",
          new Blob([fileData], { type: item.mimeType }),
          item.name
        );

        const res = await nocoClient.uploadAttachment(
          { path: storagePath },
          form
        );
        if (Array.isArray(res) && res.length > 0) {
          const uploadedFile = res[0];
          uploadedFile.title = item.name;
          uploadedFiles.push(uploadedFile);
        } else {
          errors.push(`${item.name}: upload returned no attachment`);
        }
      } catch (error) {
        console.warn(`Failed to process file ${item.name}: ${error.message}`);
        errors.push(`${item.name}: ${error.message}`);
      }
    }

    if (uploadedFiles.length === 0) {
      return { ok: false, found: items.length, errors };
    }

    // Update the record's retouch attachment field
    // Clearing `note` reopens the de-dup latch that RetouchToHaravanService
    // closes: these are new images, so the row needs syncing to Haravan again.
    await nocoClient.updateRecords(tableId, {
      id: recordId,
      retouch: uploadedFiles,
      note: null
    });

    return { ok: true, found: items.length, errors };
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
