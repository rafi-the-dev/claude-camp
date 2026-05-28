const path = require('path');
const fs = require('fs');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.camp');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULTS = {
  vaultPath: path.join(os.homedir(), 'obsidian', 'My-LLM-Wiki'),
  templatePath: path.join(os.homedir(), 'project-wiki-template'),
  claudeMode: 'merge',
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
  const claudeMdPath = config.claudeMode === 'separate'
    ? path.join(os.homedir(), 'CAMP.md')
    : path.join(os.homedir(), 'CLAUDE.md');
  console.log('Camp Configuration:');
  console.log(`  Vault:       ${config.vaultPath}`);
  console.log(`  Template:    ${config.templatePath}`);
  console.log(`  CLAUDE.md:   ${claudeMdPath} (${config.claudeMode})`);
  console.log(`  User:        ${config.userName || '(not set)'}`);
  console.log(`  Config file: ${CONFIG_FILE}`);
}

module.exports = { loadConfig, saveConfig, showConfig, DEFAULTS, CONFIG_DIR, CONFIG_FILE };