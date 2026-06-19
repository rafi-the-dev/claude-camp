const path = require('path');
const fs = require('fs');
const { loadConfig } = require('./config');
const { getTarget, resolveAgents, CAMP_COMMANDS } = require('./targets');
const { installCommands, buildWikiSection, copyTemplate, copyVaultPageTemplate } = require('./init');

// Matches the trailing "## LLM Wiki" instructions block (init always appends it
// to the end of the merge file, so it runs to EOF).
const WIKI_SECTION_REGEX = /\n*## LLM Wiki[\s\S]*$/;

// Refresh the "## LLM Wiki" / "## Project Wiki" instructions to the shipped
// version. Preserves any of the user's own content that precedes the section.
function refreshInstructions(config, target) {
  const wikiSection = buildWikiSection(config);
  const mergeFile = target.mergeFile;
  const splitFile = target.splitFile;
  fs.mkdirSync(path.dirname(mergeFile), { recursive: true });

  if (config.claudeMode === 'separate') {
    // The split file holds only the wiki section — safe to overwrite wholesale.
    fs.mkdirSync(path.dirname(splitFile), { recursive: true });
    fs.writeFileSync(splitFile, wikiSection);
    console.log(`  Refreshed wiki section in ${target.splitLabel}`);

    // Make sure the merge file still references the split file.
    const reference = `Read ${target.splitLabel} for LLM Wiki instructions and project wiki rules.\n`;
    if (fs.existsSync(mergeFile)) {
      const existing = fs.readFileSync(mergeFile, 'utf8');
      if (!existing.includes(target.splitLabel)) {
        fs.writeFileSync(mergeFile, existing + '\n\n' + reference);
        console.log(`  Restored reference in ${target.mergeLabel}`);
      }
    } else {
      fs.writeFileSync(mergeFile, reference);
      console.log(`  Created ${target.mergeLabel} with reference`);
    }
    return;
  }

  // Merge mode: replace the trailing wiki section, keeping everything before it.
  if (fs.existsSync(mergeFile)) {
    const existing = fs.readFileSync(mergeFile, 'utf8');
    if (WIKI_SECTION_REGEX.test(existing)) {
      const preserved = existing.replace(WIKI_SECTION_REGEX, '').trimEnd();
      const next = preserved.length === 0 ? wikiSection : preserved + '\n\n' + wikiSection;
      fs.writeFileSync(mergeFile, next);
      console.log(`  Refreshed wiki section in ${target.mergeLabel}`);
    } else {
      // No existing section — append a fresh one.
      fs.writeFileSync(mergeFile, existing.trimEnd() + '\n\n' + wikiSection);
      console.log(`  Added wiki section to ${target.mergeLabel}`);
    }
  } else {
    fs.writeFileSync(mergeFile, wikiSection);
    console.log(`  Created ${target.mergeLabel} with wiki section`);
  }
}

function update(opts = {}) {
  console.log('\ncamp update — Refresh Camp tooling (your wikis are left untouched)\n');

  const config = loadConfig();
  if (!config) {
    console.log('  Camp is not configured. Run `camp init` first.');
    process.exit(1);
  }

  const agents = resolveAgents(config);
  console.log(`Updating agents: ${agents.map(a => getTarget(a).label).join(', ')}\n`);

  for (const agent of agents) {
    const target = getTarget(agent);
    console.log(`[${target.label}]`);

    // 1. Slash commands / prompt templates — these are tooling, safe to overwrite.
    installCommands(config, target);
    console.log(`  Refreshed ${CAMP_COMMANDS.length} wiki commands in ${target.commandsDir}`);

    // 2. Instructions section (CLAUDE.md / AGENTS.md / CAMP.md).
    refreshInstructions(config, target);
  }

  // 3. Templates — opt-in, since you may have customized them.
  if (opts.templates) {
    copyTemplate(config);
    console.log(`  Refreshed project-wiki template in ${config.templatePath}`);
    copyVaultPageTemplate(config);
    console.log(`  Refreshed vault page template (projects/_template.md)`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('  Camp updated!\n');
  console.log('  Refreshed: slash commands + instructions section' + (opts.templates ? ' + templates' : ''));
  console.log('  Preserved: Obsidian vault content, debugging/, patterns/,');
  console.log('             projects/ pages, and every project_wiki/');
  if (!opts.templates) {
    console.log('\n  Tip: add --templates to also refresh the project-wiki and');
    console.log('       vault page templates (overwrites any customizations there).');
  }
  console.log('');
}

module.exports = { update };
