# Changelog

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