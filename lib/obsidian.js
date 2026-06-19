const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { loadConfig } = require('./config');
const { getTarget, resolveAgents, CAMP_COMMANDS } = require('./targets');

const CONFIG_DIR = path.join(os.homedir(), '.camp');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function isObsidianCLIAvailable() {
  const cmd = process.platform === 'win32' ? 'Obsidian.com' : 'obsidian';
  try {
    execFileSync(cmd, ['version'], {
      stdio: 'pipe',
      timeout: 5000,
      shell: process.platform === 'win32',
    });
    return true;
  } catch {
    return false;
  }
}

function getObsidianCLICmd() {
  return process.platform === 'win32' ? 'Obsidian.com' : 'obsidian';
}

function doctor() {
  const config = loadConfig();
  let issues = 0;
  const agents = resolveAgents(config);

  console.log('Camp Doctor — System Health Check\n');

  // 1. Config
  if (!config) {
    console.log('  [FAIL] Config not found. Run `camp init` first.');
    issues++;
  } else {
    console.log(`  [OK]   Config found at ${CONFIG_FILE}`);
    console.log(`  [OK]   Agents: ${agents.map(a => getTarget(a).label).join(', ')}`);
  }

  // 2. Obsidian CLI
  if (isObsidianCLIAvailable()) {
    console.log('  [OK]   Obsidian CLI is available');
  } else {
    const cmd = getObsidianCLICmd();
    console.log(`  [FAIL] Obsidian CLI not found (tried: ${cmd})`);
    console.log('         Enable it: Obsidian > Settings > General > Command line interface > ON');
    console.log('         Then click "Register CLI" and restart your terminal.');
    if (process.platform === 'win32') {
      console.log('         Windows: use a normal-privilege terminal (not admin).');
      console.log('         Git Bash users: create a ~/bin/obsidian wrapper script.');
    }
    issues++;
  }

  // 3. Vault directory
  if (config) {
    if (fs.existsSync(config.vaultPath)) {
      console.log(`  [OK]   Vault exists at ${config.vaultPath}`);
    } else {
      console.log(`  [FAIL] Vault not found at ${config.vaultPath}`);
      issues++;
    }

    // 4. Template directory
    if (fs.existsSync(config.templatePath)) {
      console.log(`  [OK]   Template exists at ${config.templatePath}`);
    } else {
      console.log(`  [FAIL] Template not found at ${config.templatePath}`);
      issues++;
    }
  }

  // 5 + 6. Per-agent: commands and instructions file
  for (const agent of agents) {
    const target = getTarget(agent);
    const commandsDir = target.commandsDir;
    const claudePath = target.mergeFile;
    const campPath = target.splitFile;
    console.log(`\n  [${target.label}]`);

    // Wiki commands
    let cmdCount = 0;
    for (const cmd of CAMP_COMMANDS) {
      if (fs.existsSync(path.join(commandsDir, cmd))) cmdCount++;
    }
    if (cmdCount === CAMP_COMMANDS.length) {
      console.log(`  [OK]   All ${CAMP_COMMANDS.length} wiki commands installed in ${commandsDir}`);
    } else {
      console.log(`  [FAIL] Only ${cmdCount}/${CAMP_COMMANDS.length} wiki commands found in ${commandsDir}`);
      issues++;
    }

    // Instructions file (CLAUDE.md / AGENTS.md / CAMP.md)
    if (config && config.claudeMode === 'separate') {
      if (fs.existsSync(campPath)) {
        console.log(`  [OK]   ${campPath} exists (separate mode)`);
      } else {
        console.log(`  [FAIL] ${campPath} not found`);
        issues++;
      }
      // Check that the merge file references the split file
      if (fs.existsSync(claudePath)) {
        const claudeContent = fs.readFileSync(claudePath, 'utf8');
        if (claudeContent.includes(target.splitLabel)) {
          console.log(`  [OK]   ${claudePath} references ${target.splitLabel}`);
        } else {
          console.log(`  [FAIL] ${claudePath} does not reference ${target.splitLabel}`);
          console.log('         Run `camp init` again to add the reference.');
          issues++;
        }
      }
    } else if (fs.existsSync(claudePath)) {
      const content = fs.readFileSync(claudePath, 'utf8');
      if (content.includes('LLM Wiki')) {
        console.log(`  [OK]   ${claudePath} has wiki section (merge mode)`);
      } else {
        console.log(`  [FAIL] ${claudePath} exists but missing wiki section`);
        issues++;
      }
    } else {
      console.log(`  [FAIL] ${claudePath} not found`);
      issues++;
    }
  }

  console.log(`\n${issues === 0 ? 'All checks passed!' : `${issues} issue(s) found.`}`);
}

module.exports = { isObsidianCLIAvailable, getObsidianCLICmd, doctor };