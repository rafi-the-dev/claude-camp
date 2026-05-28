---
description: "Save a session checkpoint so you can resume later with full context. Creates a checkpoint file in project_wiki/checkpoints/ with current task, state, decisions, and next steps."
---

Save a checkpoint for the current session. $ARGUMENTS (checkpoint name — required)

## Step 1 — Create checkpoints directory

Check if `./project_wiki/checkpoints/` exists. If not, create it.

## Step 2 — Capture session state

Gather from the current conversation:
1. **Current task**: What are we working on right now? (1-2 sentences)
2. **What's done**: What has been completed so far? (bullet list)
3. **What's in progress**: What's partially done? (bullet list)
4. **Next steps**: What should be done next? (ordered list)
5. **Key decisions made this session**: Any architectural or design decisions? (bullet list)
6. **Open questions**: Anything unresolved? (bullet list)
7. **Files modified this session**: Which files were created or changed? (bullet list)

## Step 3 — Write the checkpoint file

Create: `./project_wiki/checkpoints/[name].md`

Use this format:

```markdown
---
title: Checkpoint: [name]
tags: [checkpoint]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Checkpoint: [name]

## Current Task
[1-2 sentence summary of what we're working on]

## Done
- [what was completed]

## In Progress
- [what's partially done]

## Next Steps
1. [first thing to do next]
2. [second thing]

## Key Decisions
- [decisions made this session and why]

## Open Questions
- [anything unresolved]

## Files Modified
- [files created or changed this session]

## Connections
- [[project_wiki/project]] — root project page
```

## Step 4 — Update project_wiki/progress.md

Append to the Session Log in `./project_wiki/progress.md`:
`- YYYY-MM-DD: Checkpoint saved — [name]`

Set `updated: YYYY-MM-DD` in frontmatter.

## Step 5 — Confirm

```
## Checkpoint Saved: [name]

**File:** project_wiki/checkpoints/[name].md
**Current task:** [summary]
**Next steps:** [first next step]

Run `/camp-checkpoint-resume [name]` to resume this checkpoint in a new session.
Run `/camp-checkpoint-resume` (no name) to list all checkpoints.
```

Vault: My-LLM-Wiki (at {{VAULT_PATH}})