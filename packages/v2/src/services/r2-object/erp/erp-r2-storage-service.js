import { R2StorageService } from "services/r2-object/core/r2-storage-service";

export class ERPR2StorageService extends R2StorageService {
  constructor(env) {
    super(env, "JEMMIA_ERP_R2_STORAGE");
  }

  async getObjectByKey(key) {
    return this._getObject(key);
  }
}
