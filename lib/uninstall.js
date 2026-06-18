const path = require('path');
const fs = require('fs');
const os = require('os');
const readline = require('readline');
const { loadConfig, CONFIG_FILE, CONFIG_DIR } = require('./config');

const COMMANDS_DIR = path.join(os.homedir(), '.claude', 'commands');

// All camp-*.md commands installed by init
const CAMP_COMMANDS = [
  'camp-bug.md',
  'camp-checkpoint-resume.md',
  'camp-checkpoint.md',
  'camp-dream.md',
  'camp-end.md',
  'camp-find.md',
  'camp-ingest.md',
  'camp-lint.md',
  'camp-project-init-ns.md',
  'camp-project-init.md',
  'camp-resume.md',
];

function question(rl, prompt) {
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === 'y' || trimmed === 'yes');
    });
  });
}

function removeClaudeMdSection(config) {
  const claudeMdPath = path.join(os.homedir(), 'CLAUDE.md');
  const campMdPath = path.join(os.homedir(), 'CAMP.md');

  if (config.claudeMode === 'separate') {
    // Split mode: remove CAMP.md and the reference line in CLAUDE.md
    if (fs.existsSync(campMdPath)) {
      fs.unlinkSync(campMdPath);
      console.log('  Removed CAMP.md');
    }

    if (fs.existsSync(claudeMdPath)) {
      let content = fs.readFileSync(claudeMdPath, 'utf8');
      // Remove the reference line
      const lines = content.split('\n');
      const filtered = lines.filter(line => !line.includes('CAMP.md'));
      const newContent = filtered.join('\n').replace(/\n{3,}/g, '\n\n').trim();

      if (newContent.length === 0) {
        fs.unlinkSync(claudeMdPath);
        console.log('  Removed empty CLAUDE.md');
      } else {
        fs.writeFileSync(claudeMdPath, newContent + '\n');
        console.log('  Removed CAMP.md reference from CLAUDE.md');
      }
    }
  } else {
    // Merge mode: remove the wiki section from CLAUDE.md
    if (fs.existsSync(claudeMdPath)) {
      let content = fs.readFileSync(claudeMdPath, 'utf8');

      // Find and remove the "## LLM Wiki" section through to end of file
      // The section starts with "## LLM Wiki" and goes to EOF or the next ## of same level
      const wikiSectionRegex = /\n*## LLM Wiki[\s\S]*$/;
      if (wikiSectionRegex.test(content)) {
        content = content.replace(wikiSectionRegex, '').trim();
        if (content.length === 0) {
          fs.unlinkSync(claudeMdPath);
          console.log('  Removed empty CLAUDE.md');
        } else {
          fs.writeFileSync(claudeMdPath, content + '\n');
          console.log('  Removed wiki section from CLAUDE.md');
        }
      } else {
        console.log('  No wiki section found in CLAUDE.md (already clean)');
      }
    }
  }
}

function removeCommands() {
  let removed = 0;
  for (const cmd of CAMP_COMMANDS) {
    const cmdPath = path.join(COMMANDS_DIR, cmd);
    if (fs.existsSync(cmdPath)) {
      fs.unlinkSync(cmdPath);
      removed++;
    }
  }
  console.log(`  Removed ${removed} wiki commands from ${COMMANDS_DIR}`);
}

function removeConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
    console.log(`  Removed config: ${CONFIG_FILE}`);
  }
  // Remove config dir if empty
  if (fs.existsSync(CONFIG_DIR)) {
    const remaining = fs.readdirSync(CONFIG_DIR);
    if (remaining.length === 0) {
      fs.rmSync(CONFIG_DIR, { recursive: true });
      console.log(`  Removed config dir: ${CONFIG_DIR}`);
    }
  }
}

async function uninstall(opts = {}) {
  console.log('\ncamp uninstall — Remove Camp artifacts\n');

  const config = loadConfig();
  if (!config) {
    console.log('  Camp is not configured. Nothing to uninstall.');
    console.log('  Run `camp init` first.');
    process.exit(1);
  }

  if (opts.yes) {
    // Non-interactive: remove everything except vault (data safety)
    console.log('  Using defaults (--yes mode)\n');

    console.log('Removing:');
    removeCommands();
    removeClaudeMdSection(config);
    removeConfig();

    console.log('\n  NOTE: Vault and template directories were kept to preserve your data.');
    console.log(`  Vault:       ${config.vaultPath}`);
    console.log(`  Template:    ${config.templatePath}`);
    console.log('\n  To remove them manually:');
    console.log(`    rm -rf "${config.vaultPath}"`);
    console.log(`    rm -rf "${config.templatePath}"`);
    console.log('\n  Camp has been uninstalled!\n');
    return;
  }

  // Interactive mode
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log('Camp installed the following:');
    console.log(`  1. Wiki commands     (${CAMP_COMMANDS.length} files in ${COMMANDS_DIR})`);
    console.log(`  2. CLAUDE.md/CAMP.md (wiki section)`);
    console.log(`  3. Config file       (${CONFIG_FILE})`);
    console.log(`  4. Vault directory   (${config.vaultPath})`);
    console.log(`  5. Template dir      (${config.templatePath})`);
    console.log();

    console.log('What would you like to remove?\n');

    const removeCmds = await question(rl, '  Remove wiki commands? [y/N] ');
    const removeClaude = await question(rl, '  Remove wiki section from CLAUDE.md/CAMP.md? [y/N] ');
    const removeConf = await question(rl, '  Remove config file? [y/N] ');
    const removeVault = await question(rl, '  Remove vault directory? [y/N] (contains your data!) ');
    const removeTemplate = await question(rl, '  Remove template directory? [y/N] ');

    console.log('\nRemoving:');

    if (removeCmds) removeCommands();
    else console.log('  Skipped wiki commands');

    if (removeClaude) removeClaudeMdSection(config);
    else console.log('  Skipped CLAUDE.md/CAMP.md');

    if (removeConf) removeConfig();
    else console.log('  Skipped config file');

    if (removeVault) {
      if (fs.existsSync(config.vaultPath)) {
        fs.rmSync(config.vaultPath, { recursive: true });
        console.log(`  Removed vault: ${config.vaultPath}`);
      }
    } else {
      console.log('  Skipped vault directory');
    }

    if (removeTemplate) {
      if (fs.existsSync(config.templatePath)) {
        fs.rmSync(config.templatePath, { recursive: true });
        console.log(`  Removed template: ${config.templatePath}`);
      }
    } else {
      console.log('  Skipped template directory');
    }

    console.log('\n  Camp has been uninstalled!\n');
  } finally {
    rl.close();
  }
}

module.exports = { uninstall };