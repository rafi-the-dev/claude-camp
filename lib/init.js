const path = require('path');
const fs = require('fs');
const os = require('os');
const readline = require('readline');
const { saveConfig, DEFAULTS, CONFIG_FILE } = require('./config');
const { isObsidianCLIAvailable, getObsidianCLICmd } = require('./obsidian');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

function question(rl, prompt, defaultVal) {
  return new Promise(resolve => {
    const display = defaultVal ? `${prompt} (${defaultVal}) ` : `${prompt} `;
    rl.question(display, answer => {
      resolve(answer.trim() || defaultVal || '');
    });
  });
}

async function init(opts = {}) {
  console.log('\ncamp init — Claude Autonomous Memory Pipeline\n');

  let config;
  const claudeMdPath = path.join(os.homedir(), 'CLAUDE.md');
  const campMdPath = path.join(os.homedir(), 'CAMP.md');
  const commandsDir = path.join(os.homedir(), '.claude', 'commands');

  if (opts.yes) {
    config = {
      vaultPath: DEFAULTS.vaultPath,
      templatePath: DEFAULTS.templatePath,
      claudeMode: opts.split ? 'separate' : 'merge',
      userName: '',
      platform: process.platform,
    };
    console.log('  Using defaults (--yes mode)\n');
  } else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      const vaultPath = await question(rl, 'Where should the Obsidian vault live?', DEFAULTS.vaultPath);
      const templatePath = await question(rl, 'Where should the project-wiki template live?', DEFAULTS.templatePath);
      const claudeMode = await question(rl, `Merge wiki section into ${claudeMdPath}, or split into ${campMdPath}? (merge/split)`, 'merge');
      const userName = await question(rl, 'Your name (for about-me.md):', '');

      config = {
        vaultPath: path.resolve(vaultPath),
        templatePath: path.resolve(templatePath),
        claudeMode: (claudeMode === 'split' || claudeMode === 'separate') ? 'separate' : 'merge',
        userName,
        platform: process.platform,
      };
    } finally {
      rl.close();
    }
  }

  // Step 2: Save config
  saveConfig(config);
  console.log(`  Config saved to ${CONFIG_FILE}`);

  // Step 3: Create Obsidian vault
  createVault(config);
  console.log('  Vault created');

  // Step 4: Copy project-wiki template
  copyTemplate(config);
  console.log('  Project-wiki template copied');

  // Step 5: Copy slash commands
  installCommands(config);
  console.log(`  Wiki commands installed to ${commandsDir}`);

  // Step 6: Configure CLAUDE.md
  configureClaudeMd(config);
  if (config.claudeMode === 'separate') {
    console.log(`  CAMP.md created with wiki section`);
    console.log(`  CLAUDE.md updated to reference CAMP.md`);
  } else {
    console.log(`  CLAUDE.md updated with wiki section (merge mode)`);
  }

  // Step 7: Obsidian CLI check
  const cliAvailable = isObsidianCLIAvailable();
  if (cliAvailable) {
    console.log('  Obsidian CLI detected');
  }

  // Step 8: Summary
  console.log('\n' + '='.repeat(50));
  console.log('  Camp is installed!\n');
  console.log(`  Vault:       ${config.vaultPath}`);
  console.log(`  Template:    ${config.templatePath}`);
  console.log(`  Config:      ${CONFIG_FILE}`);
  if (config.claudeMode === 'separate') {
    console.log(`  CAMP.md:     ${campMdPath} (wiki section)`);
    console.log(`  CLAUDE.md:   ${claudeMdPath} (references CAMP.md)`);
  } else {
    console.log(`  CLAUDE.md:   ${claudeMdPath} (wiki section merged)`);
  }
  console.log(`  Commands:    11 wiki commands in ${commandsDir}\n`);

  if (!cliAvailable) {
    console.log('  Next steps:');
    console.log('  1. Open Obsidian and add the vault: ' + config.vaultPath);
    console.log('  2. Go to Settings > General > Enable "Command line interface"');
    console.log('  3. Click "Register CLI"');
    console.log('  4. Restart your terminal');
    console.log('  5. Install the Obsidian CLI skill: https://github.com/pablo-mano/Obsidian-CLI-skill');
    console.log('  6. Run: camp doctor\n');
    if (process.platform === 'win32') {
      console.log('  Windows: use a normal-privilege terminal (not admin) for Obsidian CLI.');
      console.log('  Git Bash users: create a ~/bin/obsidian wrapper script.\n');
    }
  } else {
    console.log('  Next step:');
    console.log('  1. Open Obsidian and add the vault: ' + config.vaultPath);
    console.log('  2. Run: camp doctor\n');
    if (process.platform === 'win32') {
      console.log('  Windows: use a normal-privilege terminal (not admin) for Obsidian CLI.\n');
    }
  }
}

function createVault(config) {
  const dirs = [
    '', 'debugging', 'patterns', 'projects', 'raw', 'raw/assets',
  ];
  for (const dir of dirs) {
    fs.mkdirSync(path.join(config.vaultPath, dir), { recursive: true });
  }

  // Copy vault seed files
  const seedDir = path.join(ASSETS_DIR, 'vault-seed');
  if (fs.existsSync(seedDir)) {
    const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      let content = fs.readFileSync(path.join(seedDir, file), 'utf8');
      content = content.replace(/\{\{USER_NAME\}\}/g, config.userName || 'User');
      content = content.replace(/\{\{VAULT_PATH\}\}/g, config.vaultPath.replace(/\\/g, '/'));
      // my-projects.md goes in projects/ subdirectory
      const dest = file === 'my-projects.md'
        ? path.join(config.vaultPath, 'projects', file)
        : path.join(config.vaultPath, file);
      fs.writeFileSync(dest, content);
    }
  }

  // Copy vault template
  const templateFile = path.join(ASSETS_DIR, 'vault-template', '_template.md');
  if (fs.existsSync(templateFile)) {
    let content = fs.readFileSync(templateFile, 'utf8');
    content = content.replace(/\{\{VAULT_PATH\}\}/g, config.vaultPath.replace(/\\/g, '/'));
    fs.writeFileSync(path.join(config.vaultPath, 'projects', '_template.md'), content);
  }
}

function copyTemplate(config) {
  fs.mkdirSync(config.templatePath, { recursive: true });
  const srcDir = path.join(ASSETS_DIR, 'project-wiki-template');
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
      content = content.replace(/\{\{VAULT_PATH\}\}/g, config.vaultPath.replace(/\\/g, '/'));
      fs.writeFileSync(path.join(config.templatePath, file), content);
    }
  }
}

function installCommands(config) {
  const commandsDir = path.join(os.homedir(), '.claude', 'commands');
  fs.mkdirSync(commandsDir, { recursive: true });

  const srcDir = path.join(ASSETS_DIR, 'commands');
  if (!fs.existsSync(srcDir)) return;

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
    content = content.replace(/\{\{VAULT_PATH\}\}/g, config.vaultPath.replace(/\\/g, '/'));
    content = content.replace(/\{\{TEMPLATE_PATH\}\}/g, config.templatePath.replace(/\\/g, '/'));
    fs.writeFileSync(path.join(commandsDir, file), content);
  }
}

function configureClaudeMd(config) {
  const wikiSectionPath = path.join(ASSETS_DIR, 'claude-sections', 'wiki-section.md');
  const projectWikiSectionPath = path.join(ASSETS_DIR, 'claude-sections', 'project-wiki-section.md');

  let wikiSection = '';
  if (fs.existsSync(wikiSectionPath)) {
    wikiSection = fs.readFileSync(wikiSectionPath, 'utf8');
  }
  if (fs.existsSync(projectWikiSectionPath)) {
    wikiSection += '\n' + fs.readFileSync(projectWikiSectionPath, 'utf8');
  }

  wikiSection = wikiSection
    .replace(/\{\{VAULT_PATH\}\}/g, config.vaultPath.replace(/\\/g, '/'))
    .replace(/\{\{TEMPLATE_PATH\}\}/g, config.templatePath.replace(/\\/g, '/'));

  const claudeMdPath = path.join(os.homedir(), 'CLAUDE.md');
  const campMdPath = path.join(os.homedir(), 'CAMP.md');

  if (config.claudeMode === 'separate') {
    // Write wiki section to CAMP.md
    fs.writeFileSync(campMdPath, wikiSection);

    // Add a reference in CLAUDE.md so Claude Code reads CAMP.md
    if (fs.existsSync(claudeMdPath)) {
      const existing = fs.readFileSync(claudeMdPath, 'utf8');
      if (!existing.includes('CAMP.md')) {
        fs.writeFileSync(claudeMdPath, existing + '\n\nRead ~/CAMP.md for LLM Wiki instructions and project wiki rules.\n');
      }
    } else {
      fs.writeFileSync(claudeMdPath, 'Read ~/CAMP.md for LLM Wiki instructions and project wiki rules.\n');
    }
  } else {
    // Merge mode: append wiki section directly into CLAUDE.md
    if (fs.existsSync(claudeMdPath)) {
      const existing = fs.readFileSync(claudeMdPath, 'utf8');
      if (existing.includes('LLM Wiki')) {
        // Already has wiki section — skip
        return;
      }
      fs.writeFileSync(claudeMdPath, existing + '\n\n' + wikiSection);
    } else {
      fs.writeFileSync(claudeMdPath, wikiSection);
    }
  }
}

module.exports = { init };