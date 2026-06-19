#!/usr/bin/env node

const { init } = require('../lib/init');
const { update } = require('../lib/update');
const { showConfig } = require('../lib/config');
const { doctor } = require('../lib/obsidian');
const { uninstall } = require('../lib/uninstall');

const args = process.argv.slice(2);
const command = args[0];
const flags = args.filter(a => a.startsWith('--'));

switch (command) {
  case 'init': {
    const agents = [];
    if (flags.includes('--all') || flags.includes('--claude')) agents.push('claude');
    if (flags.includes('--all') || flags.includes('--pi')) agents.push('pi');
    init({
      yes: flags.includes('--yes') || flags.includes('-y'),
      split: flags.includes('--split') || flags.includes('-s'),
      agents: agents.length ? agents : undefined,
    });
    break;
  }
  case 'update':
    update({
      templates: flags.includes('--templates') || flags.includes('-t'),
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
  camp init --all       Install for both Claude Code and Pi
  camp update           Refresh commands + instructions for every configured agent
  camp update --templates  Also refresh the project-wiki/vault page templates
  camp config           View current configuration
  camp doctor           Check system health
  camp uninstall        Interactive uninstall
  camp uninstall --yes  Non-interactive (keeps vault and template)

Options:
  -y, --yes       Use defaults (non-interactive)
  -s, --split     Split mode: wiki section in a separate file, referenced from the main one
      --pi        Target the Pi coding agent (prompts in ~/.pi/agent/prompts, AGENTS.md)
      --claude    Target Claude Code (commands in ~/.claude/commands, CLAUDE.md) [default]
      --all       Target both Claude Code and Pi (combine --pi --claude)
  -t, --templates With update, also overwrite the project-wiki and vault page templates
  -h, --help      Show this help
`);
    break;
  default:
    console.log(`Unknown command: ${command}`);
    console.log('Run `camp --help` for available commands.');
    process.exit(1);
}