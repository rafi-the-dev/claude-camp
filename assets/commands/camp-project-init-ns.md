---
description: "New session project initialization. Reads templates, reads the entire codebase fresh, creates or updates project_wiki/ and the vault page. Use this when starting work on an existing project you haven't seen before."
---

Initialize a project from scratch — you know nothing about this project yet. $ARGUMENTS (optional: project name override)

## Step 0 — Read the templates

Read BOTH templates:

1. Vault page template: `obsidian read path="projects/_template.md"`
2. Project wiki template directory: `{{TEMPLATE_PATH}}/`
   - Read all files: project.md, rules.md, context.md, architecture.md, decisions.md, progress.md, ideas.md

Copy these EXACTLY — same sections, same order, same frontmatter. Only fill in content, never change structure.

## Step 1 — Read the entire codebase

Thoroughly scan the current working directory. You have NO prior knowledge:

1. **Config files**: Read ALL of: README.md, package.json, pyproject.toml, Cargo.toml, go.mod, setup.py, tsconfig.json, Makefile, Dockerfile, docker-compose.yml, .env.example, or any other config files present
2. **Directory structure**: List files to understand the full layout (exclude node_modules, .git, dist)
3. **Key source files**: Read the main entry points, router files, database schemas, API definitions — whatever is central to this project
4. **Tests**: Check what test framework is used, where tests live, what's tested
5. **Git history**: Run `git log --oneline -10` and `git remote -v` (if git is available) to understand recent activity and where it's hosted
6. **Build & run**: Identify how to build, test, and run the project from the configs you read

## Step 2 — Create or update project_wiki/

Check if `./project_wiki/` already exists.

### If project_wiki/ does NOT exist: create it

Copy ALL files from `{{TEMPLATE_PATH}}/` to `./project_wiki/`:
- project.md, rules.md, context.md, architecture.md, decisions.md, progress.md, ideas.md

Then fill in content from what you learned in Step 1.

### If project_wiki/ EXISTS: update it

1. Read `./project_wiki/project.md` first (the root file)
2. Read all linked files (rules.md, context.md, architecture.md, decisions.md, progress.md, ideas.md)
3. If any files are missing, create them from the template
4. If project_wiki has an old monolithic project.md (all content in one file), split it into root project.md + 6 separate files following the template structure
5. Update content with what you learned from the codebase
6. Set `updated: YYYY-MM-DD` on every file you touch

## Step 3 — Create or update the vault page

Read the vault page template: `obsidian read path="projects/_template.md"`

Check if the project already has a page in the vault:
Run: `obsidian search query="[project name]" path="projects" format=json`

### If no page exists: create it from the template

Copy the template — same sections, same order. Fill in content.

**Replace `{{PROJECT_PATH}}` with the actual project directory path** in the `## Project Wiki` section.

Use: `obsidian create path="projects/[project-name]" content="..."`

Then update my-projects hub:
Run: `obsidian read path="projects/my-projects.md"`
Add under "## Active Projects":
`- [[projects/[project-name]]] — one-line description → /absolute/path/to/project/project_wiki/`

The `→` arrow followed by the project_wiki path lets you quickly locate and read project context from the hub page.

### If page already exists: update it

Read the current page. Compare against the template — if any sections are missing, add them. Then update content. Vault page is a pointer — don't duplicate project_wiki content.

Also update the project's entry in my-projects.md — make sure the `→ /path/to/project_wiki/` pointer is accurate.

## Step 4 — Present a complete briefing

```
## Project Initialized: [Name] (New Session)

**What it is:** [one-line summary]
**Stack:** [tech stack]
**Current state:** [how mature / what's built]
**Key decisions:** [2-3 most important]
**Ideas found:** [any interesting ideas from the codebase]

**project_wiki/** created/updated from {{TEMPLATE_PATH}}/
- project.md (root), rules.md, context.md, architecture.md, decisions.md, progress.md, ideas.md

**Main wiki:** [[projects/[project-name]]] created/updated from [[projects/_template]]
Added/updated under [[projects/my-projects]]

Run `/camp-resume` at the start of future sessions to load context.
```

## Important Rules
- ALWAYS copy from the templates — `{{TEMPLATE_PATH}}/` for project_wiki, `[[projects/_template]]` for vault page
- Same sections, same order, same frontmatter — only fill in content
- project_wiki/ has 7 files: project.md (root) + 6 linked files
- Each project is ONE page in the vault: `projects/project-name.md`
- Vault page is a pointer — details live in project_wiki/ NOT in the vault page
- **project_wiki is truth** — if the vault page and project_wiki disagree, fix the vault page
- If project_wiki has old monolithic project.md, split into root + separate files
- Project pages link ONLY to [[projects/my-projects]] — never to index or about-me
- **Replace `{{PROJECT_PATH}}`** in the vault page template with the actual project directory path

Vault: My-LLM-Wiki (at {{VAULT_PATH}})