#!/usr/bin/env node

const { init } = require('../lib/init');
const { showConfig } = require('../lib/config');
const { doctor } = require('../lib/obsidian');

const args = process.argv.slice(2);
const command = args[0];
const flags = args.filter(a => a.startsWith('--'));

switch (command) {
  case 'init':
    init({
      yes: flags.includes('--yes') || flags.includes('-y'),
      split: flags.includes('--split') || flags.includes('-s'),
    });
    break;
  case 'config':
    showConfig();
    break;
  case 'doctor':
    doctor();
    break;
  case undefined:
  case '--help':
  case '-h':
    console.log(`
camp — Claude Autonomous Memory Pipeline

Usage:
  camp init           Interactive setup
  camp init --yes     Non-interactive (use defaults, merge mode)
  camp init --split   Non-interactive (use defaults, split mode)
  camp config         View current configuration
  camp doctor         Check system health

Options:
  -y, --yes    Use defaults (non-interactive)
  -s, --split  Split mode: wiki section in ~/CAMP.md, reference in ~/CLAUDE.md
  -h, --help   Show this help
`);
    break;
  default:
    console.log(`Unknown command: ${command}`);
    console.log('Run `camp --help` for available commands.');
    process.exit(1);
}