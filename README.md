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
├── profile.md            ← preferences (AI fills in)
├── debugging.md          ← bug solutions hub (links to debugging/ entries)
├── patterns.md           ← reusable patterns hub (links to patterns/ entries)
├── debugging/            ← bug solution entries (global)
├── patterns/             ← reusable pattern entries (global)
└── projects/
    ├── my-projects.md    ← project hub
    └── project-name.md   ← pointer to project_wiki/

Project Wiki (in each project directory)
└── project_wiki/
    ├── project.md        ← root (links to all other files)
    ├── rules.md          ← AI reads this FIRST
    ├── context.md        ← what it is, goal, stack, how to run
    ├── architecture.md   ← structure, components, data flow
    ├── decisions.md      ← decisions + rationale
    ├── progress.md       ← current state + session log
    ├── ideas.md          ← brainstorming and future ideas
    └── checkpoints/      ← session checkpoints (created by /camp-checkpoint)
```

### It's Autonomous

Camp is designed to be 100% automatic. Once installed, Claude Code handles everything through auto-triggers in your CLAUDE.md:

- Starting a new project? `/camp-project-init` runs automatically
- Encountered a bug? `/camp-bug` checks past solutions first
- Made a decision? Add it to `decisions.md` immediately
- Ending a session? `/camp-end` saves everything

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
- Whether to merge the wiki section into `~/CLAUDE.md` or split it into `~/CAMP.md`
- Your name (for the about-me page, AI fills in the rest)

### Merge vs Split

| Mode | What happens | CLAUDE.md |
|------|-------------|-----------|
| **Merge** (default) | Wiki section appended directly to `~/CLAUDE.md` | Contains full wiki instructions |
| **Split** | Wiki section goes in `~/CAMP.md` | Gets a reference line: "Read ~/CAMP.md for wiki instructions" |

Both modes work — Claude Code reads `~/CLAUDE.md` automatically. In split mode, that reference line tells it to also read `CAMP.md`.

**Non-interactive mode** (for CI/scripts):

```bash
camp init --yes          # merge mode
camp init --split        # split mode
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `camp init` | Interactive setup |
| `camp init --yes` | Non-interactive setup (merge mode) |
| `camp init --split` | Non-interactive setup (split mode — wiki in ~/CAMP.md) |
| `camp config` | View current configuration |
| `camp doctor` | Check system health |

## Wiki Slash Commands (11)

All commands use the `/camp-` prefix for namespace clarity:

| Command | Purpose |
|---------|---------|
| `/camp-bug <error>` | Search past debugging solutions |
| `/camp-find <topic>` | Search the entire wiki |
| `/camp-ingest <source>` | Save knowledge to the wiki |
| `/camp-lint` | Health check: broken links, orphans |
| `/camp-resume` | Load or create project context |
| `/camp-project-init` | Initialize a new project |
| `/camp-project-init-ns` | Fresh init — reads codebase from scratch |
| `/camp-dream` | Clean up and maintain everything |
| `/camp-end` | Session wrap-up: save, update, verify |
| `/camp-checkpoint <name>` | Save a session checkpoint |
| `/camp-checkpoint-resume <name>` | Resume a saved checkpoint (lists all if no name) |

### Session Checkpoints

Checkpoints let you save your progress mid-session and resume it later in a new context window:

- `/camp-checkpoint bugfix-auth` — saves current task, progress, decisions, and next steps
- `/camp-checkpoint-resume bugfix-auth` — loads that checkpoint and briefs you on where you left off
- `/camp-checkpoint-resume` — lists all available checkpoints if you don't specify a name

Checkpoints are stored in `project_wiki/checkpoints/` and include: current task, what's done, what's in progress, next steps, key decisions, and files modified.

### Auto-Triggers

You don't need to run these manually. CLAUDE.md auto-triggers them:

| Situation | What happens |
|-----------|-------------|
| You start a new project | `/camp-project-init` runs |
| You start a session | `/camp-resume` loads context |
| You encounter a bug | `/camp-bug` checks past solutions |
| You solve a bug | `/camp-ingest` saves the solution |
| You make a decision | `decisions.md` gets updated |
| You end a session | `/camp-end` saves everything |
| You want to save mid-session progress | `/camp-checkpoint` saves state |
| You resume from a checkpoint | `/camp-checkpoint-resume` loads context |

## What Gets Installed

After `camp init`:

```
~/.camp/config.json                         ← camp configuration
~/obsidian/My-LLM-Wiki/                     ← Obsidian vault (global wiki)
  ├── index.md, about-me.md, profile.md    ← seed pages
  ├── debugging.md, patterns.md            ← hub pages
  ├── debugging/, patterns/, projects/      ← wiki directories
  └── projects/my-projects.md, _template.md ← project hub + template
~/project-wiki-template/                    ← 7 template files for new projects
~/.claude/commands/                         ← 11 wiki slash commands
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

All 56 checks should pass.

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