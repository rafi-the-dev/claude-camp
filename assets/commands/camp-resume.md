---
description: "Load project context at the start of a session. Reads about-me from the main wiki, then reads or creates project_wiki/ in the current directory and briefs you on project state. Also cross-references the main wiki for relevant past solutions."
---

Load project context and resume work. $ARGUMENTS (optional: project path override)

## Step 1 — Read the main wiki

Read the user's profile and preferences:
1. Run: obsidian read path="about-me.md"
2. Run: obsidian read path="profile.md"

This gives you context about who the user is, how they learn, and what they care about.

## Step 1.5 — Read project rules FIRST

If `./project_wiki/rules.md` exists, read it BEFORE doing anything else.
These are project-specific rules the AI must follow while working on this project.
If rules.md doesn't exist but project.md exists, read project.md first and follow any rules there.

## Step 2 — Locate the project wiki

Check if `./project_wiki/` exists in the current working directory.

**project_wiki is truth** — if the vault page and project_wiki disagree, fix the vault page.

### If project_wiki/ does NOT exist: initialize it

Copy ALL files from `{{TEMPLATE_PATH}}/` to `./project_wiki/`:
- project.md, rules.md, context.md, architecture.md, decisions.md, progress.md, ideas.md

Then fill in content based on what you can infer from the codebase.

### If project_wiki/ EXISTS: read and brief

1. Read `./project_wiki/project.md` (the root file)
2. Read all linked files that exist: rules.md, context.md, architecture.md, decisions.md, progress.md, ideas.md
3. If any linked files are missing, create them from `{{TEMPLATE_PATH}}/`
4. Present a structured briefing:

```
## Project Resume: [Name]

**Rules:** [key project rules]
**What it is:** ...
**Stack:** ...
**Current state:** ...
**In progress:** ...
**Recent decisions:** ...
**Ideas:** ...
**Next up:** ...
```

5. Append to progress.md Session Log:
   `- YYYY-MM-DD: Session started. [one line summary of current task if known]`

## Step 3 — Cross-reference the main wiki

Run: obsidian search query="[project tech stack keywords]" format=json
If any debugging entries or patterns are relevant to this project's stack, mention them:
> "Relevant wiki entries: [[debugging/...]], [[patterns/...]]"

## Step 4 — Confirm ready

End with: "Context loaded. Ready to work on [project name]."

Vault: My-LLM-Wiki (at {{VAULT_PATH}})