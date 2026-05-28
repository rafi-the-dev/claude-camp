#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const VAULT = path.join(os.homedir(), 'obsidian', 'My-LLM-Wiki');
const TEMPLATE = path.join(os.homedir(), 'project-wiki-template');
const COMMANDS = path.join(os.homedir(), '.claude', 'commands');
const CONFIG_FILE = path.join(os.homedir(), '.camp', 'config.json');
const CLAUDE_MD = path.join(os.homedir(), 'CLAUDE.md');

let PASS = 0;
let FAIL = 0;

function check(desc, fn) {
  try {
    if (fn()) {
      console.log(`  [PASS] ${desc}`);
      PASS++;
    } else {
      console.log(`  [FAIL] ${desc}`);
      FAIL++;
    }
  } catch (e) {
    console.log(`  [FAIL] ${desc} — ${e.message}`);
    FAIL++;
  }
}

function checkFile(desc, filePath) {
  check(desc, () => fs.existsSync(filePath));
}

function checkNoFile(desc, filePath) {
  check(desc, () => !fs.existsSync(filePath));
}

function checkNoContent(desc, filePath, content) {
  check(desc, () => {
    if (!fs.existsSync(filePath)) return true;
    return !fs.readFileSync(filePath, 'utf8').includes(content);
  });
}

function checkContent(desc, filePath, content) {
  check(desc, () => {
    if (!fs.existsSync(filePath)) return false;
    return fs.readFileSync(filePath, 'utf8').includes(content);
  });
}

// Clean slate
const vaultParent = path.dirname(VAULT);
const templateParent = path.dirname(TEMPLATE);
if (fs.existsSync(path.join(os.homedir(), '.camp'))) {
  fs.rmSync(path.join(os.homedir(), '.camp'), { recursive: true });
}
if (fs.existsSync(vaultParent) && fs.existsSync(VAULT)) {
  fs.rmSync(VAULT, { recursive: true });
}
if (fs.existsSync(TEMPLATE)) {
  fs.rmSync(TEMPLATE, { recursive: true });
}
if (fs.existsSync(COMMANDS)) {
  const files = fs.readdirSync(COMMANDS).filter(f => f.endsWith('.md'));
  for (const f of files) fs.unlinkSync(path.join(COMMANDS, f));
}
if (fs.existsSync(CLAUDE_MD)) fs.unlinkSync(CLAUDE_MD);

// Run camp init --yes
console.log('>>> Running: camp init --yes\n');
try {
  execFileSync('camp', ['init', '--yes'], { stdio: 'inherit' });
} catch (e) {
  console.error('camp init failed:', e.message);
  process.exit(1);
}

console.log('\n==========================================');
console.log('  Verifying Installation');
console.log('==========================================\n');

// Config
checkFile('Config exists', CONFIG_FILE);

// Vault directories (core only, NO research)
check('Vault root exists', () => fs.existsSync(VAULT));
check('debugging/ exists', () => fs.existsSync(path.join(VAULT, 'debugging')));
check('patterns/ exists', () => fs.existsSync(path.join(VAULT, 'patterns')));
check('projects/ exists', () => fs.existsSync(path.join(VAULT, 'projects')));
check('raw/ exists', () => fs.existsSync(path.join(VAULT, 'raw')));
checkNoFile('research/ does NOT exist', path.join(VAULT, 'research'));
checkNoFile('research/ai-papers/ does NOT exist', path.join(VAULT, 'research', 'ai-papers'));

// Vault seed files
checkFile('index.md', path.join(VAULT, 'index.md'));
checkFile('about-me.md', path.join(VAULT, 'about-me.md'));
checkFile('profile.md', path.join(VAULT, 'profile.md'));
checkFile('debugging.md hub', path.join(VAULT, 'debugging.md'));
checkFile('patterns.md hub', path.join(VAULT, 'patterns.md'));
checkFile('projects/my-projects.md', path.join(VAULT, 'projects', 'my-projects.md'));
checkFile('projects/_template.md', path.join(VAULT, 'projects', '_template.md'));
checkNoFile('research/how-i-understood-things.md', path.join(VAULT, 'research', 'how-i-understood-things.md'));

// Index includes debugging and patterns hubs
checkContent('index.md links to debugging hub', path.join(VAULT, 'index.md'), '[[debugging]]');
checkContent('index.md links to patterns hub', path.join(VAULT, 'index.md'), '[[patterns]]');

// No personal content
checkNoContent('No hardcoded names in index.md', path.join(VAULT, 'index.md'), 'rafi');
checkNoContent('No emails in profile.md', path.join(VAULT, 'profile.md'), '@');
checkNoContent('No research in index.md', path.join(VAULT, 'index.md'), 'research');
checkNoContent('No how-i-understood in about-me.md', path.join(VAULT, 'about-me.md'), 'how-i-understood');

// Template files (all 7)
checkFile('template project.md', path.join(TEMPLATE, 'project.md'));
checkFile('template rules.md', path.join(TEMPLATE, 'rules.md'));
checkFile('template context.md', path.join(TEMPLATE, 'context.md'));
checkFile('template architecture.md', path.join(TEMPLATE, 'architecture.md'));
checkFile('template decisions.md', path.join(TEMPLATE, 'decisions.md'));
checkFile('template progress.md', path.join(TEMPLATE, 'progress.md'));
checkFile('template ideas.md', path.join(TEMPLATE, 'ideas.md'));

// Template paths replaced
checkNoContent('template project.md has real path', path.join(TEMPLATE, 'project.md'), '{{VAULT_PATH}}');

// Wiki commands (all 11, with camp- prefix)
const cmds = ['camp-bug.md', 'camp-find.md', 'camp-ingest.md', 'camp-lint.md',
  'camp-resume.md', 'camp-project-init.md', 'camp-project-init-ns.md',
  'camp-dream.md', 'camp-end.md',
  'camp-checkpoint.md', 'camp-checkpoint-resume.md'];
for (const cmd of cmds) {
  checkFile(cmd, path.join(COMMANDS, cmd));
}

// Commands have real paths (no placeholders)
checkNoContent('camp-bug.md has real vault path', path.join(COMMANDS, 'camp-bug.md'), '{{VAULT_PATH}}');
checkNoContent('camp-project-init.md has real template path', path.join(COMMANDS, 'camp-project-init.md'), '{{TEMPLATE_PATH}}');
checkNoContent('camp-checkpoint.md has real paths', path.join(COMMANDS, 'camp-checkpoint.md'), '{{VAULT_PATH}}');
checkNoContent('camp-checkpoint-resume.md has real paths', path.join(COMMANDS, 'camp-checkpoint-resume.md'), '{{VAULT_PATH}}');

// Commands use /camp- prefix (no old-style references)
checkNoContent('No old /bug reference in camp-end.md', path.join(COMMANDS, 'camp-end.md'), '`/ingest`');
checkNoContent('No old /wiki-resume reference in camp-project-init.md', path.join(COMMANDS, 'camp-project-init.md'), '`/wiki-resume`');
checkNoContent('No old /wiki-resume reference in camp-project-init-ns.md', path.join(COMMANDS, 'camp-project-init-ns.md'), '`/wiki-resume`');

// CLAUDE.md
checkFile('CLAUDE.md exists', CLAUDE_MD);
checkContent('CLAUDE.md has LLM Wiki section', CLAUDE_MD, 'LLM Wiki');
checkNoContent('CLAUDE.md has no placeholders', CLAUDE_MD, '{{VAULT_PATH}}');
checkContent('CLAUDE.md has camp-bug command', CLAUDE_MD, '/camp-bug');
checkContent('CLAUDE.md has camp-checkpoint command', CLAUDE_MD, '/camp-checkpoint');

// _template.md has {{PROJECT_PATH}} placeholder
checkContent('_template.md has PROJECT_PATH placeholder', path.join(VAULT, 'projects', '_template.md'), '{{PROJECT_PATH}}');

// No research references in commands
checkNoContent('No how-i-understood in camp-dream.md', path.join(COMMANDS, 'camp-dream.md'), 'how-i-understood');
checkNoContent('No research/ai-papers in camp-ingest.md', path.join(COMMANDS, 'camp-ingest.md'), 'research/ai-papers');

// Summary
console.log('\n==========================================');
if (FAIL === 0) {
  console.log(`  ALL ${PASS} TESTS PASSED`);
} else {
  console.log(`  ${PASS} passed, ${FAIL} failed`);
}
console.log('==========================================');

process.exit(FAIL > 0 ? 1 : 0);