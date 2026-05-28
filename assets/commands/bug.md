---
description: "Search the wiki for past debugging solutions before starting from scratch. Use this whenever you encounter an error or bug — check the wiki first so you don't repeat past work. Bugs are global — a fix from any project can help you now."
---

Search the wiki for past solutions to this debugging problem: $ARGUMENTS

Bugs are global — debugging entries in the wiki can come from ANY project. A Python async fix from a web scraper might solve the same issue in a data pipeline.

Steps:
1. Run: obsidian search query="$ARGUMENTS" path="debugging" format=json
   Also try key terms extracted from the error (e.g. just the error type or library name)
2. For each result, run: obsidian read path="<result-path>"
3. Also search patterns: obsidian search query="$ARGUMENTS" path="patterns"
4. If a match is found: present the solution clearly, cite the page as [[wikilink]], highlight the key fix
5. If no match is found: say "No matching entries in the wiki yet." Offer to create an entry after we solve it
   - When creating a debugging entry: link it back to `[[projects/project-name]]` in Connections
   - Also add it to the project page under "## Related Bugs"

Vault: My-LLM-Wiki (at {{VAULT_PATH}})