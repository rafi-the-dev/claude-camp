const path = require('path');
const fs = require('fs');
const os = require('os');
const readline = require('readline');
const { loadConfig, CONFIG_FILE, CONFIG_DIR } = require('./config');
const { getTarget, resolveAgents, CAMP_COMMANDS } = require('./targets');

function question(rl, prompt) {
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === 'y' || trimmed === 'yes');
    });
  });
}

function removeClaudeMdSection(config, target) {
  const mergeFile = target.mergeFile;
  const splitFile = target.splitFile;
  const mergeName = path.basename(mergeFile);

  if (config.claudeMode === 'separate') {
    // Split mode: remove the split file and its reference line in the merge file
    if (fs.existsSync(splitFile)) {
      fs.unlinkSync(splitFile);
      console.log(`  Removed ${target.splitLabel}`);
    }

    if (fs.existsSync(mergeFile)) {
      let content = fs.readFileSync(mergeFile, 'utf8');
      // Remove the reference line pointing at the split file
      const lines = content.split('\n');
      const filtered = lines.filter(line => !line.includes(target.splitLabel));
      const newContent = filtered.join('\n').replace(/\n{3,}/g, '\n\n').trim();

      if (newContent.length === 0) {
        fs.unlinkSync(mergeFile);
        console.log(`  Removed empty ${mergeName}`);
      } else {
        fs.writeFileSync(mergeFile, newContent + '\n');
        console.log(`  Removed ${target.splitLabel} reference from ${mergeName}`);
      }
    }
  } else {
    // Merge mode: remove the wiki section from the merge file
    if (fs.existsSync(mergeFile)) {
      let content = fs.readFileSync(mergeFile, 'utf8');

      // Find and remove the "## LLM Wiki" section through to end of file
      // The section starts with "## LLM Wiki" and goes to EOF or the next ## of same level
      const wikiSectionRegex = /\n*## LLM Wiki[\s\S]*$/;
      if (wikiSectionRegex.test(content)) {
        content = content.replace(wikiSectionRegex, '').trim();
        if (content.length === 0) {
          fs.unlinkSync(mergeFile);
          console.log(`  Removed empty ${mergeName}`);
        } else {
          fs.writeFileSync(mergeFile, content + '\n');
          console.log(`  Removed wiki section from ${mergeName}`);
        }
      } else {
        console.log(`  No wiki section found in ${mergeName} (already clean)`);
      }
    }
  }
}

function removeCommands(target) {
  let removed = 0;
  for (const cmd of CAMP_COMMANDS) {
    const cmdPath = path.join(target.commandsDir, cmd);
    if (fs.existsSync(cmdPath)) {
      fs.unlinkSync(cmdPath);
      removed++;
    }
  }
  console.log(`  Removed ${removed} wiki commands from ${target.commandsDir}`);
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

  const agents = resolveAgents(config);
  const targets = agents.map(getTarget);

  if (opts.yes) {
    // Non-interactive: remove everything except vault (data safety)
    console.log('  Using defaults (--yes mode)\n');

    console.log(`Removing (agents: ${targets.map(t => t.label).join(', ')}):`);
    for (const target of targets) {
      removeCommands(target);
      removeClaudeMdSection(config, target);
    }
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
    const agentList = targets.map(t => t.label).join(', ');
    console.log(`Camp installed the following (agents: ${agentList}):`);
    console.log(`  1. Wiki commands     (${CAMP_COMMANDS.length} files per agent)`);
    for (const t of targets) console.log(`       - ${t.commandsDir}`);
    console.log(`  2. Wiki instructions (per agent)`);
    for (const t of targets) {
      console.log(`       - ${config.claudeMode === 'separate' ? t.splitLabel : t.mergeLabel}`);
    }
    console.log(`  3. Config file       (${CONFIG_FILE})`);
    console.log(`  4. Vault directory   (${config.vaultPath})`);
    console.log(`  5. Template dir      (${config.templatePath})`);
    console.log();

    console.log('What would you like to remove?\n');

    const removeCmds = await question(rl, '  Remove wiki commands (all agents)? [y/N] ');
    const removeClaude = await question(rl, '  Remove wiki instructions (all agents)? [y/N] ');
    const removeConf = await question(rl, '  Remove config file? [y/N] ');
    const removeVault = await question(rl, '  Remove vault directory? [y/N] (contains your data!) ');
    const removeTemplate = await question(rl, '  Remove template directory? [y/N] ');

    console.log('\nRemoving:');

    if (removeCmds) for (const t of targets) removeCommands(t);
    else console.log('  Skipped wiki commands');

    if (removeClaude) for (const t of targets) removeClaudeMdSection(config, t);
    else console.log('  Skipped wiki instructions');

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