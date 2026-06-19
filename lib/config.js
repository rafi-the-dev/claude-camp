const path = require('path');
const fs = require('fs');
const os = require('os');
const { getTarget, resolveAgents } = require('./targets');

const CONFIG_DIR = path.join(os.homedir(), '.camp');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULTS = {
  vaultPath: path.join(os.homedir(), 'obsidian', 'My-LLM-Wiki'),
  templatePath: path.join(os.homedir(), 'project-wiki-template'),
  claudeMode: 'merge',
  agents: ['claude'],
  userName: '',
};

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function saveConfig(config) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function showConfig() {
  const config = loadConfig();
  if (!config) {
    console.log('Camp is not configured. Run `camp init` to set up.');
    return;
  }
  const agents = resolveAgents(config);
  console.log('Camp Configuration:');
  console.log(`  Agents:       ${agents.map(a => getTarget(a).label).join(', ')}`);
  console.log(`  Vault:        ${config.vaultPath}`);
  console.log(`  Template:     ${config.templatePath}`);
  console.log(`  User:         ${config.userName || '(not set)'}`);
  console.log(`  Config file:  ${CONFIG_FILE}`);
  for (const agent of agents) {
    const target = getTarget(agent);
    const instructionsFile = config.claudeMode === 'separate' ? target.splitFile : target.mergeFile;
    console.log(`\n  [${target.label}]`);
    console.log(`    Commands:     ${target.commandsDir}`);
    console.log(`    Instructions: ${instructionsFile} (${config.claudeMode})`);
  }
}

module.exports = { loadConfig, saveConfig, showConfig, DEFAULTS, CONFIG_DIR, CONFIG_FILE };