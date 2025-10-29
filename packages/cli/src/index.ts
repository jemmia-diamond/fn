#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { SetupProgram } from './programs/setup.program';

const program = new Command();
const programName = 'fn';

// CLI metadata
program
  .name(programName)
  .description('A simple CLI tool for FN project')
  .version('1.0.0');

new SetupProgram(program);

// Default help when no command is provided
program.action(() => {
  console.log(chalk.red(`No command specified. Use "${programName} help" for available commands.`));
  program.help();
});

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (process.argv.slice(2).length === 0) {
  program.outputHelp();
}