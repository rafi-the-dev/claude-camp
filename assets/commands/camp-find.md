---
description: "Search the entire wiki for information about a topic. Use this when the user asks about something that might be documented — patterns, papers, past solutions, project context."
---

Search the wiki for information about: $ARGUMENTS

Steps:
1. Run: obsidian search query="$ARGUMENTS" format=json
2. For each result, run: obsidian read path="<result-path>"
3. Synthesize the findings into a clear, organized answer
4. Cite sources using [[wikilink]] format so the user can navigate to them in Obsidian
5. If nothing relevant is found, say so and suggest what kind of entry could be added

Vault: My-LLM-Wiki (at {{VAULT_PATH}})