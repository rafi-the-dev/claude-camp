---
description: "Resume a saved checkpoint to continue a session with full context. Lists all checkpoints if no name is given, or loads a specific one and briefs you on what was happening."
---

Resume a saved checkpoint. $ARGUMENTS (checkpoint name — if empty, list all checkpoints)

## If no name provided — list checkpoints

1. Check if `./project_wiki/checkpoints/` exists
2. If it doesn't exist: say "No checkpoints found. Run `/camp-checkpoint <name>` to save one."
3. If it exists: list all `.md` files in the directory
4. For each checkpoint, read the file and extract:
   - Title (from frontmatter or heading)
   - Current Task (first line)
   - Created date
5. Present them as a numbered list:
   ```
   ## Available Checkpoints

   1. [name] — [current task summary] (created YYYY-MM-DD)
   2. [name] — [current task summary] (created YYYY-MM-DD)

   Run `/camp-checkpoint-resume [name]` to resume one.
   ```
6. Stop here — wait for the user to specify which one.

## If name provided — resume checkpoint

1. Read `./project_wiki/checkpoints/[name].md`
2. If it doesn't exist: say "Checkpoint '[name]' not found." and list available checkpoints instead.
3. Read the project context:
   - `./project_wiki/project.md` (root)
   - `./project_wiki/rules.md` (MUST read first)
   - `./project_wiki/context.md`
   - `./project_wiki/progress.md`
   - `./project_wiki/decisions.md`
4. Cross-reference the main wiki:
   - Run: `obsidian search query="[project tech stack keywords]" format=json`
   - Check for relevant debugging entries or patterns
5. Present a resume briefing:

```
## Resuming: [name]

**Current task:** [from checkpoint]
**What's done:** [from checkpoint]
**In progress:** [from checkpoint]
**Next steps:**
1. [first next step]
2. [second next step]

**Key decisions so far:** [from checkpoint]
**Open questions:** [from checkpoint]

**Project state:** [from project_wiki/progress.md Current State]

Ready to continue. Starting with: [first next step]
```

6. Append to `./project_wiki/progress.md` Session Log:
   `- YYYY-MM-DD: Resumed checkpoint '[name]'`

7. After resuming, start working on the first next step.

Vault: My-LLM-Wiki (at {{VAULT_PATH}})