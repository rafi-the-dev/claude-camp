## LLM Wiki

Your persistent knowledge base lives at `{{VAULT_PATH}}` (Obsidian vault: My-LLM-Wiki).
Read `index.md` first, then drill into relevant pages.

### When to use wiki commands (AUTOMATIC — do these without being asked)

| When | What to do |
|------|-----------|
| **User asks to create/start a new project** | Run `/project-init` to set up project_wiki/ and vault page BEFORE writing any code |
| **Starting a session on a known project** | Run `/wiki-resume` to load project context |
| **Starting work on an unfamiliar project** | Run `/project-init-ns` to read the codebase fresh and set up context |
| **Before doing any work on a project** | Read `project_wiki/rules.md` FIRST — it contains project-specific rules |
| **You encounter a bug or error** | Run `/bug <error>` FIRST — bugs are global, a fix from any project can help |
| **You solve a bug or debug something** | Run `/ingest <description>` — saves to global `debugging/` and links back to the project |
| **You make an architectural decision** | Add it to `project_wiki/decisions.md` immediately |
| **Any change to project structure** | Update `project_wiki/architecture.md` and/or `context.md` immediately |
| **You complete a task or feature** | Update `project_wiki/progress.md` — add to session log, update Current State |
| **Finishing a session or leaving a project** | Run `/end` — updates all project_wiki files, saves knowledge, verifies health |
| **Wiki feels messy or stale** | Run `/dream` to clean up and maintain everything |
| **User mentions a pattern, paper, or concept** | Run `/find <topic>` — check what's already documented |
| **User explicitly asks for a wiki command** | Run that command directly |

**User profile**: `{{VAULT_PATH}}/about-me.md` — read this to personalize explanations.

### Key rule

**The wiki compounds.** Every solution saved here saves time in the future. If you spend more than a few minutes debugging something, save it. If you learn a pattern that could recur, save it. The cost is near zero; the value compounds.