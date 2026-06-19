const path = require('path');
const fs = require('fs');
const os = require('os');
const readline = require('readline');
const { saveConfig, DEFAULTS, CONFIG_FILE } = require('./config');
const { isObsidianCLIAvailable, getObsidianCLICmd } = require('./obsidian');
const { getTarget, normalizeAgent, CAMP_COMMANDS } = require('./targets');

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

  if (opts.yes) {
    config = {
      vaultPath: DEFAULTS.vaultPath,
      templatePath: DEFAULTS.templatePath,
      claudeMode: opts.split ? 'separate' : 'merge',
      agent: normalizeAgent(opts.agent || DEFAULTS.agent),
      userName: '',
      platform: process.platform,
    };
    console.log('  Using defaults (--yes mode)\n');
  } else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      const vaultPath = await question(rl, 'Where should the Obsidian vault live?', DEFAULTS.vaultPath);
      const templatePath = await question(rl, 'Where should the project-wiki template live?', DEFAULTS.templatePath);
      // A --pi / --claude flag skips the prompt; otherwise ask.
      const agent = opts.agent
        ? normalizeAgent(opts.agent)
        : normalizeAgent(await question(rl, 'Which coding agent? (claude/pi)', DEFAULTS.agent));
      const target = getTarget(agent);
      const claudeMode = await question(rl, `Merge wiki section into ${target.mergeLabel}, or split into ${target.splitLabel}? (merge/split)`, 'merge');
      const userName = await question(rl, 'Your name (for about-me.md):', '');

      config = {
        vaultPath: path.resolve(vaultPath),
        templatePath: path.resolve(templatePath),
        claudeMode: (claudeMode === 'split' || claudeMode === 'separate') ? 'separate' : 'merge',
        agent,
        userName,
        platform: process.platform,
      };
    } finally {
      rl.close();
    }
  }

  const target = getTarget(config.agent);

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
  installCommands(config, target);
  console.log(`  Wiki commands installed to ${target.commandsDir}`);

  // Step 6: Configure instructions file (CLAUDE.md / AGENTS.md)
  configureClaudeMd(config, target);
  if (config.claudeMode === 'separate') {
    console.log(`  ${target.splitLabel} created with wiki section`);
    console.log(`  ${target.mergeLabel} updated to reference it`);
  } else {
    console.log(`  ${target.mergeLabel} updated with wiki section (merge mode)`);
  }

  // Step 7: Obsidian CLI check
  const cliAvailable = isObsidianCLIAvailable();
  if (cliAvailable) {
    console.log('  Obsidian CLI detected');
  }

  // Step 8: Summary
  console.log('\n' + '='.repeat(50));
  console.log('  Camp is installed!\n');
  console.log(`  Agent:        ${target.label}`);
  console.log(`  Vault:        ${config.vaultPath}`);
  console.log(`  Template:     ${config.templatePath}`);
  console.log(`  Config:       ${CONFIG_FILE}`);
  if (config.claudeMode === 'separate') {
    console.log(`  ${target.splitLabel} (wiki section)`);
    console.log(`  ${target.mergeLabel} (references it)`);
  } else {
    console.log(`  Instructions: ${target.mergeFile} (wiki section merged)`);
  }
  console.log(`  Commands:     ${CAMP_COMMANDS.length} wiki commands in ${target.commandsDir}\n`);

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

function installCommands(config, target) {
  fs.mkdirSync(target.commandsDir, { recursive: true });

  const srcDir = path.join(ASSETS_DIR, 'commands');
  if (!fs.existsSync(srcDir)) return;

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
    content = content.replace(/\{\{VAULT_PATH\}\}/g, config.vaultPath.replace(/\\/g, '/'));
    content = content.replace(/\{\{TEMPLATE_PATH\}\}/g, config.templatePath.replace(/\\/g, '/'));
    // Translate Claude's $ARGUMENTS to the target agent's argument syntax.
    content = target.transformCommand(content);
    fs.writeFileSync(path.join(target.commandsDir, file), content);
  }
}

function configureClaudeMd(config, target) {
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

  const mergeFile = target.mergeFile;
  const splitFile = target.splitFile;
  // Ensure the parent directory exists (e.g. ~/.pi/agent for the Pi target).
  fs.mkdirSync(path.dirname(mergeFile), { recursive: true });

  if (config.claudeMode === 'separate') {
    // Write the wiki section to the split file (CAMP.md)
    fs.mkdirSync(path.dirname(splitFile), { recursive: true });
    fs.writeFileSync(splitFile, wikiSection);

    // Add a reference in the merge file so the agent reads the split file.
    const reference = `Read ${target.splitLabel} for LLM Wiki instructions and project wiki rules.\n`;
    if (fs.existsSync(mergeFile)) {
      const existing = fs.readFileSync(mergeFile, 'utf8');
      if (!existing.includes(target.splitLabel)) {
        fs.writeFileSync(mergeFile, existing + '\n\n' + reference);
      }
    } else {
      fs.writeFileSync(mergeFile, reference);
    }
  } else {
    // Merge mode: append wiki section directly into the merge file.
    if (fs.existsSync(mergeFile)) {
      const existing = fs.readFileSync(mergeFile, 'utf8');
      if (existing.includes('LLM Wiki')) {
        // Already has wiki section — skip
        return;
      }
      fs.writeFileSync(mergeFile, existing + '\n\n' + wikiSection);
    } else {
      fs.writeFileSync(mergeFile, wikiSection);
    }
  }
}

module.exports = { init };