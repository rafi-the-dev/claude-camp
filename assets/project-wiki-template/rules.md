---
title: Rules
updated: YYYY-MM-DD
---

# Rules

**AI reads this file FIRST before doing any work on this project.**

## Conventions
- YAML frontmatter on all wiki pages
- Wikilinks `[[page-name]]` in vault, standard markdown links in project_wiki/
- Project vault pages link ONLY to `[[projects/my-projects]]`

## Before Starting Work
- Read [project.md](project.md) for overview and links to all files

## While Working
- Update the relevant files (see [project.md](project.md) for all links)
- Run `/bug <error>` before debugging from scratch
- Run `/ingest` after solving any non-trivial problem

## Before Committing
- Verify build succeeds
- Run tests
- Ensure no secrets or .env files are staged

## Project-Specific Rules