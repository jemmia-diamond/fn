import { Command } from 'commander';
import { DatabaseProgram } from './database.program';

/**
 * Set for base project
 */
export class SetupProgram {
  private command = 'setup';
  private program: Command;
  private databaseProgram: DatabaseProgram;

  constructor(program: Command) {
    this.program = program;
    this.program.command(this.command).action(this.setup.bind(this));
    this.databaseProgram = new DatabaseProgram(program);
  }

  /**
   * Set up project
   * 1. Sync base sql
   * 2. Run prisma migration
   */
  private async setup() {
    await this.databaseProgram.prismaMigrateDeploy();
    await this.databaseProgram.createBaseTables();
  }
}
