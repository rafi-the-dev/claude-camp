---
description: "Session wrap-up. Checks that all wiki pages are up to date, project_wiki is current, and any knowledge from this session has been saved. Run this before ending a session."
---

Wrap up the current session. Make sure everything is saved and up to date.

## Step 1 — Review what happened this session

Summarize what was done: bugs fixed, decisions made, patterns learned, features built.

## Step 2 — Save any unsaved knowledge

For each item from Step 1, ask: should this be in the wiki?
- Debugging solution? → `/camp-ingest` it
- Architectural decision? → add to `project_wiki/decisions.md` or `/camp-ingest` it
- New pattern learned? → `/camp-ingest` it

If there's nothing worth saving, skip this step.

## Step 3 — Update project_wiki (if it exists)

If `./project_wiki/` exists in the current directory:

1. **project.md**: check if Info section needs updating (goal, stack, how-to-run changed?)
2. **rules.md**: update if any new project conventions were established
3. **context.md**: update if stack or how-to-run changed
4. **architecture.md**: update if any structural changes were made
5. **decisions.md**: add any new decisions with rationale
6. **progress.md**: append to Session Log: `- YYYY-MM-DD: [summary of what was done]`; update "Current State" and "In Progress"
7. **ideas.md**: add any new ideas, move completed ideas to Maybe Later
8. If any file is missing, create it from `{{TEMPLATE_PATH}}/`
9. Set `updated: YYYY-MM-DD` in frontmatter of every file you touched

**project_wiki is truth** — if the vault page and project_wiki disagree, fix the vault page.

## Step 4 — Verify main wiki health

1. Run: `obsidian orphans` — check for disconnected pages
2. Run: `obsidian unresolved` — check for broken wikilinks
3. Verify graph connectivity:
   - Hub pages link to `index` and each other
   - Project pages link ONLY to `projects/my-projects` (NOT to index or about-me)
   - Project pages link OUT to related `debugging/` and `patterns/` entries
   - Debugging entries link back to the project where the bug was found
   - Pattern entries link to projects that use them
4. If any page is disconnected, add the missing links

## Step 5 — Confirm

Present a summary:
```
## Session Wrap-Up

**Done this session:** [brief list]
**Saved to wiki:** [pages created/updated]
**Project wiki updated:** [yes/no, which files]
**Wiki health:** [clean / issues found and fixed]
```

Vault: My-LLM-Wiki (at {{VAULT_PATH}})