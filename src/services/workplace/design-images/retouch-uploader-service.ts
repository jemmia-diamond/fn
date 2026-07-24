import { v4 as uuidv4 } from "uuid";
import * as Sentry from "@sentry/cloudflare";
import { z } from "zod";
import NocoDBClient from "services/clients/nocodb-client";
import GoogleDriveClient from "services/google/drive-client";
import { ERPR2StorageService } from "services/r2-object/erp/erp-r2-storage-service";
import {
  BASE_ID, TABLE_ID, COLUMN_ID, VIEW_ID, R2_TMP_PREFIX,
  colorMapping, extractFolderIdFromLink
} from "services/workplace/design-images/utils.js";

const RetouchUploaderPayloadSchema = z.object({
  type: z.string(),
  data: z.object({
    rows: z.array(z.object({
      id: z.number(),
      retouch: z.any().nullable(),
      material_color: z.string(),
      link_retouch: z.string().nullable().optional(),
      link_render: z.string().nullable().optional()
    })).min(1)
  })
});

export default class RetouchUploaderService {
  private env: any;
  private nocoClient: NocoDBClient;
  private driveClient: GoogleDriveClient;
  private r2: ERPR2StorageService;

  constructor(env: any) {
    this.env = env;
    this.nocoClient = new NocoDBClient(env);
    this.driveClient = new GoogleDriveClient(env);
    this.r2 = new ERPR2StorageService(env);
  }

  async sync(payload: unknown) {
    const validated = RetouchUploaderPayloadSchema.parse(payload);
    const row = validated.data.rows[0];

    if (row.retouch != null) {
      throw new Error("Retouch already exists");
    }

    const subFolderName = colorMapping(row.material_color);
    if (!subFolderName) {
      throw new Error("Unknown material color");
    }

    const linkRetouch = row.link_retouch;
    if (linkRetouch) {
      const folderId = extractFolderIdFromLink(linkRetouch);
      const success = await this.uploadFromDrive(folderId, subFolderName, row.id);
      if (success) return;
    }

    const linkRender = row.link_render;
    if (linkRender) {
      const folderId = extractFolderIdFromLink(linkRender);
      await this.uploadFromDrive(folderId, subFolderName, row.id);
    }
  }

  private ensureExtension(item: { name: string; mimeType: string }) {
    if (item.name.includes(".")) return item.name;
    if (item.mimeType === "image/png") return item.name + ".png";
    if (item.mimeType === "image/jpeg") return item.name + ".jpg";
    return item.name;
  }

  private filterImageFiles(items: any[]) {
    let found = items.filter(item => item.mimeType === "image/png");
    if (found.length === 0) {
      found = items.filter(item => item.mimeType === "image/jpeg");
    }
    return found;
  }

  private async uploadFromDrive(folderId: string, subFolderName: string, recordId: number) {
    const items = await this.findRetouchImages(folderId, subFolderName);
    if (items.length <= 1) {
      return false;
    }

    for (const item of items) {
      item.name = this.ensureExtension(item);
    }

    const uploadedFiles: any[] = [];
    const uploadPath = `noco/${BASE_ID}/${TABLE_ID}/${COLUMN_ID}`;

    for (const item of items) {
      const uploaded = await this.uploadItem(item, uploadPath);
      if (uploaded) {
        uploadedFiles.push(uploaded);
      }
    }

    if (uploadedFiles.length === 0) {
      return false;
    }

    await this.nocoClient.updateRecordV1(
      { baseId: BASE_ID, tableId: TABLE_ID, viewId: VIEW_ID, recordId },
      { retouch: uploadedFiles }
    );

    return true;
  }

  private async uploadItem(item: { id: string; name: string; mimeType: string }, uploadPath: string) {
    let r2Key: string | null = null;
    try {
      const response = await this.driveClient.downloadFile(item.id);
      if (!response || !response.ok) {
        return null;
      }

      r2Key = `${R2_TMP_PREFIX}/${uuidv4()}-${item.name}`;
      await this.r2._putObject(r2Key, response.body);

      const buffer = await this.r2._getObject(r2Key);
      if (!buffer) {
        return null;
      }

      const formData = new FormData();
      const blob = new Blob([buffer], { type: item.mimeType });
      formData.append("file", blob, item.name);

      const result = await this.nocoClient.uploadStorageV1({ path: uploadPath }, formData);
      if (result && result.length > 0) {
        return result[0];
      }
      return null;
    } catch (err) {
      Sentry.captureException(err, { extra: { fileName: item.name } });
      return null;
    } finally {
      if (r2Key) {
        await this.r2.deleteObject(r2Key);
      }
    }
  }

  private async findRetouchImages(folderId: string, subFolderName: string) {
    const rootResult = await this.driveClient.listFiles(folderId);
    const rootItems: any[] = rootResult.files || [];

    const subFolderId = this.findSubFolder(rootItems, subFolderName);

    let foundItems: any[] = [];
    if (subFolderId) {
      const subResult = await this.driveClient.listFiles(subFolderId);
      foundItems = this.filterImageFiles(subResult.files || []);
    }

    if (foundItems.length === 0) {
      foundItems = this.filterImageFiles(rootItems);
    }

    foundItems.sort((a, b) => a.name.localeCompare(b.name));
    return foundItems;
  }

  private findSubFolder(items: any[], targetName: string) {
    const normalized = items.map(item => ({
      ...item,
      name: item.name.replace(/\s/g, "")
    }));
    const found = normalized.find(
      item => item.name === targetName && item.mimeType === "application/vnd.google-apps.folder"
    );
    return found ? found.id : null;
  }
}
