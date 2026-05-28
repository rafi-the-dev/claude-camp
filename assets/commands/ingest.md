---
description: "Add new knowledge to the wiki. Use this after solving a bug, learning a pattern, reading an AI paper, or starting a new project. The wiki compounds — every solution saved here saves time in the future."
---

Ingest new knowledge into the wiki: $ARGUMENTS

$ARGUMENTS can be:
- A file path (e.g. {{VAULT_PATH}}/raw/some-article.md)
- A topic/description (e.g. "debugging session: fixed async timeout in Python")
- A pasted block of text

Steps:
1. Read the source (file or description from $ARGUMENTS)
2. Identify what kind of knowledge this is: debugging solution, technical pattern, project context, or mixed
3. For each type of knowledge found:
   - Debugging → use `obsidian create path="debugging/YYYY-MM-DD-short-title"` with the debugging template
     - In the Connections section, link back to `[[projects/project-name]]` where the bug was found
   - Pattern → use `obsidian create path="patterns/pattern-name"` with the pattern template
     - In the Connections section, link to `[[projects/project-name]]` if the pattern is used in a specific project
   Use the page format templates from the CLAUDE.md schema for each type.
4. Add [[wikilinks]] between related pages
5. **If working in a project (project_wiki/ exists):**
   - Update the project's vault page to link to the new entry (only add cross-reference links, no detailed content — vault pages are pointers)
     - For debugging entries: add `- [[debugging/YYYY-MM-DD-bug-name]] — one-line summary` under "## Related Bugs"
     - For patterns: add `- [[patterns/pattern-name]] — how it's used here` under "## Patterns Used"
   - Also consider updating project_wiki/ files if relevant (e.g. add a decision to decisions.md)
   - **project_wiki is truth** — if adding to the vault page, only add links. Detailed content goes in project_wiki/.
6. Update index.md: add any new hub entries (only hubs go in the index)
7. Confirm what was saved and where

Vault: My-LLM-Wiki (at {{VAULT_PATH}})