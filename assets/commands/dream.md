---
description: "Clean up and maintain the entire wiki system automatically. Syncs vault pages with project_wiki/ (project_wiki is truth). Reads every vault page, fixes formatting, fills gaps, strengthens cross-references. Fully autonomous — run periodically to keep everything healthy."
---

Dream — clean up and maintain the entire wiki system. Fully autonomous.

## Step 1 — Main wiki

Read and process every page in the My-LLM-Wiki vault:

1. Run: `obsidian files` to get the full file list
2. For each .md file, run: `obsidian read path="<file>"`
3. For every page, check and fix:
   - **Frontmatter**: every page must have title, tags, created, updated (add missing fields, set `updated` to today if you changed anything)
   - **Wikilinks**: replace any markdown links `[text](path)` with `[[page-name]]` format
   - **Orphan detection**: after reading all pages, find concepts mentioned in text that deserve their own `[[link]]` but aren't linked yet — add the links
   - **Stale entries**: flag any debugging entries that reference specific library versions that are likely outdated
   - **Consistency**: ensure section headings follow the schema templates
4. Update `index.md`:
   - Add any new pages that were created since last update
   - Remove any entries for pages that no longer exist
   - Keep index under 50 lines — hubs only
   - Set `updated` to today

## Step 2 — Discover ALL project paths

1. Read the my-projects hub: `obsidian read path="projects/my-projects.md"`
2. For each project listed under "## Active Projects" (lines matching `- [[projects/...]]`), read that project page
3. Extract the `## Project Wiki` path from each project page — it looks like:
   `Local project context lives at: /path/to/project/project_wiki/`
4. Collect all discovered paths into a list
5. Also check "## Completed / Archived" projects

## Step 3 — Clean up ALL project wikis + sync vault pages

For EACH project path discovered in Step 2:

1. Check if the directory exists on disk (use your tools to verify, don't assume a shell command)
   - If it doesn't exist, flag it as missing in the report and skip

2. Read all files in the project_wiki/ directory

3. Clean up each project_wiki/ file:
   - **rules.md**: verify conventions are still accurate
   - **context.md**: verify stack and how-to-run against the actual codebase
   - **architecture.md**: update if structure changed
   - **decisions.md**: ensure all decisions are captured
   - **progress.md**: update "Current State" and "In Progress"; append session log: `- YYYY-MM-DD: Dream cleanup`
   - **ideas.md**: review and clean up
   - Set `updated: YYYY-MM-DD` on every file you touch
   - If any file is missing, create it from `{{TEMPLATE_PATH}}/`

4. **Sync vault page from project_wiki (project_wiki is truth)**:
   Read the project's vault page: `obsidian read path="projects/[project-name]"`

   Compare the vault page against the project_wiki/ content. The vault page is a POINTER — it should NOT duplicate project_wiki content. If the vault page has content that belongs in project_wiki/ (like architecture details, idea descriptions), move it there.

   Sync these fields from project_wiki/ → vault page:
   - **Goal**: from `project_wiki/context.md` → vault page `## Goal`
   - **Stack**: from `project_wiki/context.md` → vault page `## Stack`
   - **Key Decisions**: from `project_wiki/decisions.md` → vault page `## Key Decisions` (summary only)
   - **Related Bugs**: ensure vault page links match debugging entries
   - **Patterns Used**: ensure vault page links match pattern entries
   - **Project Wiki path**: ensure the path is correct

   If vault page and project_wiki disagree: project_wiki wins. Update the vault page.
   If vault page has content that doesn't belong (duplicated architecture, ideas, etc.): move it to project_wiki/ and remove from vault page.

## Step 4 — Cross-reference

1. Run: `obsidian orphans` — fix by adding links where appropriate
2. Run: `obsidian unresolved` — fix broken wikilinks
3. Check if any debugging entries or patterns are relevant to any project and link them
4. Verify graph connectivity:
   - Hub pages link to `index` and each other
   - Project pages link ONLY to `projects/my-projects` (NOT to index or about-me)
   - Project pages link OUT to their related `debugging/` and `patterns/` entries
   - Debugging entries link back to the project where the bug was found
   - Pattern entries link to projects that use them

## Step 5 — Report

Present a summary:
```
## Dream Cleanup — YYYY-MM-DD

### Main Wiki
- Pages reviewed: N
- Pages updated: N
- Links fixed: N

### Project Wikis (N projects)
- /path/to/project1/project_wiki/ — updated / clean / missing
- /path/to/project2/project_wiki/ — updated / clean / missing

### Sync Fixes (project_wiki → vault)
- [project-name]: moved X from vault to project_wiki / synced Goal,Stack,Decisions

### Graph Health
- Orphans: N (fixed / flagged)
- Unresolved links: N (fixed / flagged)
- Connectivity: clean / issues
```

Vault: My-LLM-Wiki (at {{VAULT_PATH}})