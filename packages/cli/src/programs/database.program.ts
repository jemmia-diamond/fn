import { Command } from "commander";
import { Client } from "pg";
import { DatabaseConfig } from "../configs/database.config";
import { readdir, readFile } from "node:fs/promises";
import { execSync } from "node:child_process";

export class DatabaseProgram {
  private command = 'database';
  private program: Command;
  private db = new Client({
    connectionString: DatabaseConfig.url,
  });

  constructor(program: Command) {
    this.program = program;
    this.program.command(this.command);
  }

  private async getSqlFiles() {
    const files = await readdir(DatabaseConfig.sqlFolderPath);
    // eslint-disable-next-line unicorn/no-array-sort
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();
    return sqlFiles;
  }

  private async readSqlContent(file: string) {
    const filePath = `${DatabaseConfig.sqlFolderPath}/${file}`;
    const sql = await readFile(filePath, 'utf8');
    return sql.trim();
  }

  /**
   * Create base tables in database
   */
  public async createBaseTables() {
    try {
      console.log('[DatabaseProgram] Creating base tables...');
      await this.db.connect();
      console.log('Connected to database');

      const files = await this.getSqlFiles();

      for (const file of files) {
        console.log(`⚡ Executing ${file}...`);
        const sql = await this.readSqlContent(file);

        if (!sql) continue;

        await this.db.query(sql);
        console.log(`✅ Executed ${file}`);
      }
    } finally {
      await this.db.end();
      console.log('Disconnected from database');
    }
  }

  /**
   * Prisma migrate deploy
   */
  public async prismaMigrateDeploy() {
    console.log('[DatabaseProgram] Prisma migrate deploy...');
      
    execSync('pnpx prisma migrate deploy && prisma generate');

    console.log(`✅ Prisma migrate deploy`);
  }
}
