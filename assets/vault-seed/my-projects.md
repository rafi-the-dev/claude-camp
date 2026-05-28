---
title: My Projects
tags: [hub, projects]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# My Projects

Hub for all projects. Each project gets its own page here, linked from its local `project_wiki/`.
**AI adds projects here** — when you start a new project, `/camp-project-init` creates the entry.

## How It Works

Every project directory has a `project_wiki/` folder with project.md as root + linked files:

```
my-project/
└── project_wiki/
    ├── project.md      ← root (info + links to other files)
    ├── rules.md        ← AI reads this FIRST
    ├── context.md, architecture.md
    ├── decisions.md, progress.md, ideas.md
    └── checkpoints/    ← session checkpoints (created by /camp-checkpoint)
```

Run `/camp-resume` at the start of any session to load context.
Run `/camp-project-init` to add a new project here.

## Active Projects

<!-- Format: - [[projects/project-name]] — one-line description → /path/to/project/project_wiki/ -->

## Completed / Archived

## Templates

- [[projects/_template]] — vault page template (copy for new projects)
- Project wiki template — on disk at the path configured during `camp init`

## Connections
- [[about-me]] — who I am
- [[index]] — full wiki catalog