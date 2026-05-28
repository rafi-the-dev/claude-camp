# CAMP — Claude Autonomous Memory Pipeline

[![npm version](https://img.shields.io/npm/v/claude-camp)](https://www.npmjs.com/package/claude-camp)
[![license](https://img.shields.io/npm/l/claude-camp)](https://www.npmjs.com/package/claude-camp)

**C**laude **A**utonomous **M**emory **P**ipeline — a persistent knowledge base for Claude Code that maintains a structured wiki across sessions using Obsidian as the viewer and slash commands as the interface.

## How It Works

Camp creates a two-layer knowledge system:

1. **Global Wiki** — an Obsidian vault with wikilinks for cross-referencing
2. **Project Wiki** — a `project_wiki/` directory in each project with 7 markdown files

The Global Wiki is your personal knowledge graph. The Project Wiki is project-specific context that lives alongside your code. If they disagree, project_wiki is truth — fix the vault page.

### Structure

```
Global Wiki (Obsidian vault)
├── index.md              ← hub catalog
├── about-me.md           ← personal hub (AI fills in)
├── profile.md           ← preferences (AI fills in)
├── debugging/            ← bug solutions (global)
├── patterns/            ← reusable patterns (global)
└── projects/
    ├── my-projects.md   ← project hub
    └── project-name.md  ← pointer to project_wiki/

Project Wiki (in each project directory)
└── project_wiki/
    ├── project.md        ← root (links to all other files)
    ├── rules.md          ← AI reads this FIRST
    ├── context.md        ← what it is, goal, stack, how to run
    ├── architecture.md   ← structure, components, data flow
    ├── decisions.md      ← decisions + rationale
    ├── progress.md       ← current state + session log
    └── ideas.md          ← brainstorming and future ideas
```

### It's Autonomous

Camp is designed to be 100% automatic. Once installed, Claude Code handles everything through auto-triggers in your CLAUDE.md:

- Starting a new project? `/project-init` runs automatically
- Encountered a bug? `/bug` checks past solutions first
- Made a decision? Add it to `decisions.md` immediately
- Ending a session? `/end` saves everything

You never manually run wiki commands. The AI does it.

## Requirements

- **Node.js 18+**
- **Claude Code** (Anthropic's CLI)
- **Obsidian v1.12+** with CLI enabled
- **Obsidian CLI Skill** — [github.com/pablo-mano/Obsidian-CLI-skill](https://github.com/pablo-mano/Obsidian-CLI-skill)

### Obsidian CLI Setup

1. Open Obsidian
2. Go to **Settings > General**
3. Enable **Command line interface**
4. Click **Register CLI**
5. Restart your terminal

### Obsidian CLI Skill Installation

Install the Obsidian CLI skill for Claude Code:

```bash
claude mcp add obsidian-cli -- npx -y @anthropic/obsidian-cli-skill
```

Or add to your project's `.claude/settings.json`:

```json
{
  "plugins": {
    "obsidian-cli": {
      "source": { "source": "github", "repo": "pablo-mano/Obsidian-CLI-skill" }
    }
  }
}
```

## Install

```bash
npm install -g claude-camp
```

## Setup

```bash
camp init
```

This will ask you:
- Where to create the Obsidian vault (default: `~/obsidian/My-LLM-Wiki`)
- Where to store the project-wiki template (default: `~/project-wiki-template`)
- Whether to merge the wiki section into `~/CLAUDE.md` or create a separate `~/CAMP.md`
- Your name (for the about-me page, AI fills in the rest)

**Non-interactive mode** (for CI/scripts):

```bash
camp init --yes
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `camp init` | Interactive setup |
| `camp init --yes` | Non-interactive setup with defaults |
| `camp config` | View current configuration |
| `camp doctor` | Check system health |

## Wiki Slash Commands (9)

Once installed, these slash commands are available in Claude Code:

| Command | Purpose |
|---------|---------|
| `/bug <error>` | Search past debugging solutions |
| `/find <topic>` | Search the entire wiki |
| `/ingest <source>` | Save knowledge to the wiki |
| `/wiki-lint` | Health check: broken links, orphans |
| `/wiki-resume` | Load or create project context |
| `/project-init` | Initialize a new project |
| `/project-init-ns` | Fresh init — reads codebase from scratch |
| `/dream` | Clean up and maintain everything |
| `/end` | Session wrap-up: save, update, verify |

### Auto-Triggers

You don't need to run these manually. CLAUDE.md auto-triggers them:

| Situation | What happens |
|-----------|-------------|
| You start a new project | `/project-init` runs |
| You start a session | `/wiki-resume` loads context |
| You encounter a bug | `/bug` checks past solutions |
| You solve a bug | `/ingest` saves the solution |
| You make a decision | `decisions.md` gets updated |
| You end a session | `/end` saves everything |

## What Gets Installed

After `camp init`:

```
~/.camp/config.json                         ← camp configuration
~/obsidian/My-LLM-Wiki/                     ← Obsidian vault (global wiki)
  ├── index.md, about-me.md, profile.md    ← seed pages
  ├── debugging/, patterns/, projects/      ← wiki directories
  └── projects/my-projects.md, _template.md ← project hub + template
~/project-wiki-template/                    ← 7 template files for new projects
~/.claude/commands/                         ← 9 wiki slash commands
~/CLAUDE.md                                 ← wiki section (merge mode)
```

## Cross-Platform

Camp works on macOS, Linux, and Windows:

| | macOS/Linux | Windows |
|---|---|---|
| Home dir | `os.homedir()` | `os.homedir()` |
| Path sep | Uses `path.join()` everywhere | Same |
| Obsidian CLI binary | `obsidian` | `Obsidian.com` |

**Windows note**: The Obsidian CLI on Windows uses `Obsidian.com` (not `obsidian`). Make sure you run from a normal-privilege terminal — admin terminals produce silent failures with the Obsidian CLI.

**Git Bash / MSYS2 note**: If using Git Bash on Windows, create a wrapper script because Bash resolves `obsidian` to `.exe` not `.com`:

```bash
#!/bin/bash
# Save as ~/bin/obsidian
/c/path/to/Obsidian.com "$@"
```

Then add `export PATH="$HOME/bin:$PATH"` to your `~/.bashrc`.

## Testing

### Quick test (Node.js, cross-platform)

```bash
node test-install.js
```

### Docker test (Linux/macOS only)

```bash
docker build -f Dockerfile.test -t camp-test .
docker run --rm camp-test
```

All 43 checks should pass.

## Customization

### Add your own slash commands

Drop any `.md` file in `~/.claude/commands/` — Claude Code picks it up automatically as a slash command.

### Modify templates

Edit files in `~/project-wiki-template/` to change the project wiki structure for new projects.

Edit `~/obsidian/My-LLM-Wiki/projects/_template.md` to change the vault page template.

### Extend the vault

Create new directories in the vault (e.g. `research/`, `ai-papers/`) and add pages. The wiki commands will discover and use them.

## License

GPL-3.0