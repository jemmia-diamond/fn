export default class DesignImageClient {
  constructor(api, baseId) {
    this.api = api;
    this.baseId = baseId;
    this.tableName = "design_images";
  }

  async findByDesignCode(designCode) {
    const res = await this.api.dbTableRow.list("noco", this.baseId, this.tableName, {
      where: `(design_code,eq,${designCode})`,
      limit: 1
    });
    return res.list?.[0] ?? null;
  }

  async updateRecords(records) {
    return await this.api.dbTableRow.bulkUpdate("noco", this.baseId, this.tableName, records);
  }

  async updateMediaByDesignCode(design_code, videos = [], images = []) {
    const row = await this.findByDesignCode(design_code);
    if (!row) return;
    const mergedVideos = Array.from(new Set([...(row.videos || []), ...videos]));
    const mergedImages = Array.from(new Set([...(row.images || []), ...images]));
    return await this.updateRecords([
      {
        id: row.id,
        videos: mergedVideos,
        images: mergedImages
      }
    ]);
  }
  async createByDesignCode(design, videos = [], images = []) {
    const data = {
      designs: [design.id],
      videos: videos,
      images: images
    };

    try {
      return await this.api.dbTableRow.create("noco", this.baseId, this.tableName, data);
    } catch (error) {
      if (
        error.response?.status === 422 &&
        error.response?.data?.error === "INVALID_PK_VALUE"
      ) {
        return { success: true };
      }
      throw error;
    }
  }
}
