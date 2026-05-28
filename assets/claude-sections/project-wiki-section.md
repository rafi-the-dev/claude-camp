## Project Wiki

Every project has a `project_wiki/` directory with `project.md` as root + linked files:
- project.md — root (info + links to other files)
- rules.md — AI reads this FIRST before any work
- context.md — what it is, goal, stack, how to run
- architecture.md — structure, components, data flow
- decisions.md — decisions made and why
- progress.md — current state, in-progress work, session log
- ideas.md — brainstorming and future ideas
- checkpoints/ — session checkpoints (created by /camp-checkpoint)

Run `/camp-resume` at the start of any session to load this context.
Read `project_wiki/rules.md` BEFORE doing any work on the project.
Update the relevant `project_wiki/` files proactively as you work — architecture changes, decisions made, tasks completed.
**project_wiki is truth** — if the vault page and project_wiki disagree, fix the vault page.