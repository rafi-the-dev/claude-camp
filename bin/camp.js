#!/usr/bin/env node

const { init } = require('../lib/init');
const { showConfig } = require('../lib/config');
const { doctor } = require('../lib/obsidian');
const { uninstall } = require('../lib/uninstall');

const args = process.argv.slice(2);
const command = args[0];
const flags = args.filter(a => a.startsWith('--'));

switch (command) {
  case 'init':
    init({
      yes: flags.includes('--yes') || flags.includes('-y'),
      split: flags.includes('--split') || flags.includes('-s'),
      agent: flags.includes('--pi') ? 'pi' : (flags.includes('--claude') ? 'claude' : undefined),
    });
    break;
  case 'config':
    showConfig();
    break;
  case 'doctor':
    doctor();
    break;
  case 'uninstall':
    uninstall({
      yes: flags.includes('--yes') || flags.includes('-y'),
    });
    break;
  case undefined:
  case '--help':
  case '-h':
    console.log(`
camp — Claude Autonomous Memory Pipeline

Usage:
  camp init             Interactive setup
  camp init --yes       Non-interactive (use defaults, merge mode)
  camp init --split     Non-interactive (use defaults, split mode)
  camp init --pi        Install for the Pi coding agent (~/.pi/agent)
  camp init --claude    Install for Claude Code (default)
  camp config           View current configuration
  camp doctor           Check system health
  camp uninstall        Interactive uninstall
  camp uninstall --yes  Non-interactive (keeps vault and template)

Options:
  -y, --yes    Use defaults (non-interactive)
  -s, --split  Split mode: wiki section in a separate file, referenced from the main one
      --pi     Target the Pi coding agent (prompts in ~/.pi/agent/prompts, AGENTS.md)
      --claude Target Claude Code (commands in ~/.claude/commands, CLAUDE.md) [default]
  -h, --help   Show this help
`);
    break;
  default:
    console.log(`Unknown command: ${command}`);
    console.log('Run `camp --help` for available commands.');
    process.exit(1);
}