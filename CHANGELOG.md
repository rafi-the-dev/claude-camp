# Changelog

## v1.3.0

### New Features

- **`camp update`** — refreshes the installed tooling (slash commands + the `## LLM Wiki` instructions section) for **every configured agent**, to the latest shipped version, **without modifying or deleting any wikis**. The Obsidian vault content (`debugging/`, `patterns/`, `projects/` pages, seed pages) and every `project_wiki/` are left untouched, and any of your own content above the instructions section is preserved. `camp update --templates` additionally refreshes the project-wiki and vault page templates.
- **Multi-agent install** — `camp init` can install for **one or both** of **Claude Code** and the **Pi coding agent**. Pick interactively ("Which coding agent(s)? (claude, pi, or both)") or non-interactively with `camp init --claude`, `--pi`, or `--all`.
  - **Claude Code**: commands in `~/.claude/commands/`, instructions in `~/CLAUDE.md`, arguments as `$ARGUMENTS`.
  - **Pi**: prompt templates in `~/.pi/agent/prompts/`, instructions in `~/.pi/agent/AGENTS.md`, arguments translated to Pi's `$@` syntax.
- The selected agents are stored in `~/.camp/config.json` (`"agents": [...]`), so `camp update`, `camp doctor`, `camp config`, and `camp uninstall` all operate on every configured agent automatically. Legacy single-`agent` configs are read transparently.

### Fixes

- **`camp doctor` command check** — was looking for the pre-v1.1.0 command names (`bug.md`, `find.md`, …) and always reported `0/9`. Now checks the 11 installed `camp-*.md` commands in the active agent's directory.

### Improvements

- New `lib/targets.js` centralizes per-agent install layout (paths + argument syntax), keeping `init`, `uninstall`, and `doctor` DRY.
- `camp config` now shows the target agent, commands dir, and instructions file.
- Test suite adds a full Pi init → verify → uninstall round-trip.

## v1.2.0

### New Features

- **`camp uninstall`** — Interactive uninstall that walks you through removing Camp artifacts (commands, CLAUDE.md section, config, vault, template) with per-item confirmation
- **`camp uninstall --yes`** — Non-interactive uninstall that removes commands, CLAUDE.md section, and config, but keeps vault and template to preserve your data
- 62 test checks (up from 56) covering init → uninstall round-trip

## v1.1.0

### New Features

- **Session checkpoints** — `/camp-checkpoint <name>` saves session state to `project_wiki/checkpoints/`, `/camp-checkpoint-resume <name>` loads it back. No name lists all checkpoints.
- **Debugging and Patterns hub pages** — `debugging.md` and `patterns.md` are now proper Obsidian hub nodes (not just folders), linked from `index.md`.
- **Project wiki paths in my-projects** — Each project entry in `projects/my-projects.md` now includes a `→ /path/to/project_wiki/` pointer for quick location.

### Breaking Changes

- **All slash commands renamed to `/camp-` prefix** — `/bug` → `/camp-bug`, `/find` → `/camp-find`, `/ingest` → `/camp-ingest`, `/wiki-lint` → `/camp-lint`, `/wiki-resume` → `/camp-resume`, `/project-init` → `/camp-project-init`, `/project-init-ns` → `/camp-project-init-ns`, `/dream` → `/camp-dream`, `/end` → `/camp-end`

### Improvements

- 56 test checks (up from 43) covering new commands, hub pages, and command prefix verification
- README updated with full command reference, checkpoint docs, and hub page structure
- All internal command references updated to `/camp-` prefix
- `debugging/` and `patterns/` are now proper graph nodes with hub pages that link to `index.md`

## v0.1.0

- Initial release
- Two-layer wiki system (Global Wiki + Project Wiki)
- 9 slash commands
- Merge and split CLAUDE.md modes
- Cross-platform support (macOS, Linux, Windows)
- Obsidian vault with wikilinks