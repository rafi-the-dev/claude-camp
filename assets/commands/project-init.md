---
description: "Initialize a new project. Copies {{TEMPLATE_PATH}}/ files and projects/_template, fills in from the codebase. Run this ONCE when starting a new project — BEFORE writing any code."
---

Initialize a new project and add it to the wiki. $ARGUMENTS (optional: project name override)

## Step 0 — Read the templates

Read BOTH templates:

1. Vault page template: `obsidian read path="projects/_template.md"`
2. Project wiki template directory: `{{TEMPLATE_PATH}}/`
   - Read all files: project.md, rules.md, context.md, architecture.md, decisions.md, progress.md, ideas.md

Copy these EXACTLY — same sections, same order, same frontmatter. Only fill in content, never change structure.

## Step 1 — Read the codebase

Scan the current working directory to understand the project:
1. Read README.md, package.json, pyproject.toml, Cargo.toml, go.mod, setup.py, or whatever project files exist
2. List the directory structure to understand architecture
3. Identify: project name, stack, entry points, what it does

## Step 2 — Create project_wiki/ (copy from template)

Copy ALL files from `{{TEMPLATE_PATH}}/` to `./project_wiki/`:
- project.md, rules.md, context.md, architecture.md, decisions.md, progress.md, ideas.md

Then fill in content based on what you found in Step 1. Same sections, same order. Only fill in the content.

## Step 3 — Add project to main wiki (copy from _template)

Copy the vault page template — same sections, same order.

**Replace `{{PROJECT_PATH}}` with the actual project directory path** in the `## Project Wiki` section.

Create ONE page: `obsidian create path="projects/[project-name]" content="..."`

Then update my-projects hub:
Run: `obsidian read path="projects/my-projects.md"`
Add under "## Active Projects":
`- [[projects/[project-name]]] — one-line description`

## Step 4 — Present summary

```
## Project Initialized: [Name]

**project_wiki/** created from {{TEMPLATE_PATH}}/
- project.md (root), rules.md, context.md, architecture.md, decisions.md, progress.md, ideas.md

**Main wiki:** [[projects/[project-name]]] created from [[projects/_template]]
Added under [[projects/my-projects]]

Run `/wiki-resume` at the start of future sessions to load context.
```

## Important Rules
- ALWAYS copy from the templates — `{{TEMPLATE_PATH}}/` for project_wiki, `[[projects/_template]]` for vault page
- Same sections, same order, same frontmatter — only fill in content
- project_wiki/ has 7 files: project.md (root) + 6 linked files
- Each project is ONE page in the vault: `projects/project-name.md`
- Vault page is a pointer — details live in project_wiki/ NOT in the vault page
- **project_wiki is truth** — if the vault page and project_wiki disagree, fix the vault page
- Project pages link ONLY to [[projects/my-projects]] — never to index or about-me
- **Replace `{{PROJECT_PATH}}`** in the vault page template with the actual project directory path

Vault: My-LLM-Wiki (at {{VAULT_PATH}})