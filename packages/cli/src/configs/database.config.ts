import path from "node:path";

export class DatabaseConfig {
  public static get url() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    return process.env.DATABASE_URL;
  }

  public static get sqlFolderPath() {
    return path.join(__dirname, '../../sql');
  }
}
