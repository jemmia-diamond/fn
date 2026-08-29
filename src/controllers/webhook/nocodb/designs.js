import GoogleDriveClient from "services/clients/google-drive-client";
import NocoDBClient from "services/clients/nocodb-client";

export default class DesignsController {
  static async sync4View(ctx) {
    const payload = await ctx.req.json().catch(() => ({}));
    const tableId = payload?.data?.table_id;
    const recordId = payload?.data?.rows?.[0]?.id;

    if (!tableId || !recordId) {
      return ctx.json(
        { error: "Invalid payload: table_id or record id is missing" },
        400
      );
    }

    const nocoClient = new NocoDBClient(ctx.env);

    const design = await nocoClient.readRecord(tableId, recordId);
    const link4View = design?.link_4view || "";

    let image4View = null;
    let lastSynced4View = "";

    if (link4View) {
      const match = link4View.match(/file\/d\/([^/]+)/);
      const fileId = match ? match[1] : null;

      if (fileId) {
        image4View = [
          {
            url: `https://lh3.googleusercontent.com/d/${fileId}`,
            title: `${recordId}.jpg`
          }
        ];
        lastSynced4View = btoa(link4View);
      } else {
        image4View = [
          {
            url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png",
            title: "not_found.png"
          }
        ];
      }
    }

    await nocoClient.updateRecords(tableId, {
      id: recordId,
      image_4view: image4View,
      last_synced_4view: lastSynced4View
    });

    return ctx.json({ message: "4view images synced successfully" }, 200);
  }

  static async syncRender(ctx) {
    const payload = await ctx.req.json().catch(() => ({}));
    const tableId = payload?.data?.table_id;
    const recordId = payload?.data?.rows?.[0]?.id;

    if (!tableId || !recordId) {
      return ctx.json(
        { error: "Invalid payload: table_id or record id is missing" },
        400
      );
    }

    const nocoClient = new NocoDBClient(ctx.env);

    const design = await nocoClient.readRecord(tableId, recordId);
    const linkRender = design?.link_render || "";

    if (!linkRender || !linkRender.includes("https://drive.google.com/drive")) {
      return ctx.json({ message: "Invalid or empty link_render" }, 400);
    }

    let folderId = linkRender.split("/").pop();
    if (folderId.includes("?")) {
      folderId = folderId.split("?")[0];
    }

    const driveClient = new GoogleDriveClient(
      ctx.env.GOOGLE_SERVICE_ACCOUNT_KEY
    );

    const IMAGES_NOT_FOUND = {
      url: "https://demofree.sirv.com/nope-not-here.jpg",
      title: "images_not_found.jpg"
    };

    const files = await driveClient.listFiles(folderId);

    let imageFiles = files.filter((f) => f.mimeType === "image/png");
    if (imageFiles.length === 0) {
      imageFiles = files.filter((f) => f.mimeType === "image/jpeg");
    }

    imageFiles.sort((a, b) => a.name.localeCompare(b.name));

    if (imageFiles.length === 0) {
      items = [IMAGES_NOT_FOUND];
    } else {
      items = imageFiles.map((f) => {
        const ext = f.mimeType === "image/png" ? ".png" : ".jpg";
        return {
          url: `https://lh3.googleusercontent.com/d/${f.id}`,
          title: f.name.split(".")[0] + ext
        };
      });
    }

    await nocoClient.updateRecords(tableId, {
      id: recordId,
      image_render: items,
      last_synced_render: btoa(linkRender)
    });

    return ctx.json({ message: "Render images synced successfully" }, 200);
  }
}
