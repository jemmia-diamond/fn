import Database from "services/database";
import HaravanAPI from "services/clients/haravan-client";
import * as crypto from "crypto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);
const UPSERT_BATCH_SIZE = 20;

export default class UserSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.dbConnection = {
      timeout: 30000,
      maxWait: 10000
    };
  }

  async sync() {
    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
    const haravanClient = new HaravanAPI(HRV_API_KEY);

    const response = await haravanClient.user.getUsers();
    const users = response?.users || [];

    if (users.length > 0) {
      await this._upsertUsers(users);
    }
  }

  _mapUser(user) {
    return {
      id: user.id ? BigInt(user.id) : null,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      account_owner: user.account_owner,
      bio: user.bio,
      im: user.im,
      receive_announcements: user.receive_announcements,
      url: user.url,
      user_type: user.user_type,
      permissions: user.permissions
    };
  }

  async _upsertUsers(users) {
    if (!users || users.length === 0) return;

    const currentDateTime = dayjs().utc().toDate();

    for (let i = 0; i < users.length; i += UPSERT_BATCH_SIZE) {
      const batch = users.slice(i, i + UPSERT_BATCH_SIZE);

      await this.db.$transaction(async (tx) => {
        const operations = batch.map(user => {
          const data = this._mapUser(user);
          const id = data.id;
          delete data.id;

          return tx.user.upsert({
            where: { id },
            create: {
              uuid: crypto.randomUUID(),
              id,
              ...data,
              database_created_at: currentDateTime,
              database_updated_at: currentDateTime
            },
            update: {
              ...data,
              database_updated_at: currentDateTime
            }
          });
        });
        await Promise.all(operations);
      }, this.dbConnection);
    }
  }
}
