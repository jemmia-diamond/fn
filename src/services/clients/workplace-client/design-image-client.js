import BaseWorkplaceClient from "services/clients/workplace-client/base-client";

export default class DesignImageClient extends BaseWorkplaceClient {
  constructor(api, baseId) {
    super(api, baseId, "design_images");
  }

  async findByDesignCode(designCode) {
    return await this.findOne({ where: `(design_code,eq,${designCode})` });
  }

  async updateRecords(records) {
    return await this.bulkUpdate(records);
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
      return await this.create(data);
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
