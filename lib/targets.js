const path = require('path');
const os = require('os');

// The 11 camp-*.md commands installed by `camp init`.
// Single source of truth shared by init, uninstall, and doctor.
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

const SUPPORTED_AGENTS = ['claude', 'pi'];

function normalizeAgent(agent) {
  return SUPPORTED_AGENTS.includes(agent) ? agent : 'claude';
}

// Coerce any agent input (string, array, or undefined) into a deduped list of
// supported agents, preserving order. Falls back to ['claude'] when empty.
function normalizeAgents(input) {
  const arr = Array.isArray(input) ? input : (input ? [input] : []);
  const deduped = [...new Set(arr.filter(a => SUPPORTED_AGENTS.includes(a)))];
  return deduped.length ? deduped : ['claude'];
}

// Reads the configured agents, supporting both the current `agents` array and
// the legacy single `agent` string from pre-multi-agent configs.
function resolveAgents(config) {
  if (config && Array.isArray(config.agents)) return normalizeAgents(config.agents);
  if (config && config.agent) return normalizeAgents(config.agent);
  return ['claude'];
}

// Parses an interactive answer like "claude", "pi", "both", or "claude,pi".
function parseAgentsInput(str) {
  const s = (str || '').toLowerCase().trim();
  if (!s) return ['claude'];
  if (s === 'both' || s === 'all') return ['claude', 'pi'];
  return normalizeAgents(s.split(/[\s,]+/).filter(Boolean));
}

// Returns the install layout for a given coding agent. Content is identical
// across agents — only the install locations and command argument syntax differ.
//   - Claude Code: commands in ~/.claude/commands, instructions in ~/CLAUDE.md,
//     arguments referenced as $ARGUMENTS.
//   - Pi: prompt templates in ~/.pi/agent/prompts, instructions in
//     ~/.pi/agent/AGENTS.md, arguments referenced as $@.
function getTarget(agent) {
  const home = os.homedir();

  if (normalizeAgent(agent) === 'pi') {
    const piDir = path.join(home, '.pi', 'agent');
    return {
      agent: 'pi',
      label: 'Pi',
      commandsDir: path.join(piDir, 'prompts'),
      commandsLabel: '~/.pi/agent/prompts',
      mergeFile: path.join(piDir, 'AGENTS.md'),
      mergeLabel: '~/.pi/agent/AGENTS.md',
      splitFile: path.join(piDir, 'CAMP.md'),
      splitLabel: '~/.pi/agent/CAMP.md',
      // Pi prompt templates use $@ / $1 instead of Claude's $ARGUMENTS.
      transformCommand: content => content.replace(/\$ARGUMENTS/g, '$@'),
    };
  }

  return {
    agent: 'claude',
    label: 'Claude Code',
    commandsDir: path.join(home, '.claude', 'commands'),
    commandsLabel: '~/.claude/commands',
    mergeFile: path.join(home, 'CLAUDE.md'),
    mergeLabel: '~/CLAUDE.md',
    splitFile: path.join(home, 'CAMP.md'),
    splitLabel: '~/CAMP.md',
    transformCommand: content => content,
  };
}

module.exports = {
  getTarget,
  normalizeAgent,
  normalizeAgents,
  resolveAgents,
  parseAgentsInput,
  CAMP_COMMANDS,
  SUPPORTED_AGENTS,
};
