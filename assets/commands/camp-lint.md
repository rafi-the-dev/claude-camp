---
description: "Health check the wiki. Run this periodically to find broken links, orphan pages, stale entries, and missing cross-references. Checks both the vault AND all project_wiki/ directories. Keeps the wiki healthy as it grows."
---

Run a health check on the wiki — vault + all project_wiki/ directories.

## Step 1 — Vault health

1. Run: `obsidian read path="index.md"` — get the registered page list
2. Run: `obsidian orphans` — find pages with no inbound links
3. Run: `obsidian unresolved` — find broken wikilinks
4. Read a sample of debugging/ entries and flag any with stale library version references
5. Look for concepts or tools mentioned repeatedly across pages that deserve their own dedicated page

## Step 2 — Project wiki health

1. Read `projects/my-projects.md` to discover all project paths
2. For each project listed under Active Projects:
   - Read the project's vault page to get the `## Project Wiki` path
   - Check if the directory exists on disk
   - Verify all 7 files exist: project.md, rules.md, context.md, architecture.md, decisions.md, progress.md, ideas.md
   - Verify project.md links to all other files, and other files link back to project.md (hub structure)
   - If any file is missing, flag it for recreation from `{{TEMPLATE_PATH}}/`
3. Check for truth violations: if a vault page has content that belongs in project_wiki/ (architecture details, idea descriptions), flag it

## Step 3 — Report findings

Prioritized list:
- **Critical**: broken links, missing project_wiki/ files, truth violations
- **Important**: orphan pages, missing index entries, broken hub structure
- **Nice to have**: suggested new pages, missing cross-references

For each issue, suggest the exact fix.

Vault: My-LLM-Wiki (at {{VAULT_PATH}})