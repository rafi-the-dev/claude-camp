#!/bin/bash
set -e

echo "=========================================="
echo "  Camp Installation Test"
echo "=========================================="

# Clean slate
rm -rf ~/.camp ~/obsidian ~/project-wiki-template ~/.claude/commands ~/CLAUDE.md

# Run camp init with defaults
echo ""
echo ">>> Running: camp init --yes"
camp init --yes

echo ""
echo "=========================================="
echo "  Verifying Installation"
echo "=========================================="

PASS=0
FAIL=0

check() {
  local desc="$1"
  if eval "$2" >/dev/null 2>&1; then
    echo "  [PASS] $desc"
    PASS=$((PASS+1))
  else
    echo "  [FAIL] $desc"
    FAIL=$((FAIL+1))
  fi
}

check_file() {
  if [ -f "$2" ]; then
    echo "  [PASS] $1"
    PASS=$((PASS+1))
  else
    echo "  [FAIL] $1 — missing: $2"
    FAIL=$((FAIL+1))
  fi
}

check_no_file() {
  if [ ! -e "$2" ]; then
    echo "  [PASS] $1"
    PASS=$((PASS+1))
  else
    echo "  [FAIL] $1 — should NOT exist: $2"
    FAIL=$((FAIL+1))
  fi
}

check_no_content() {
  if ! grep -q "$3" "$2" 2>/dev/null; then
    echo "  [PASS] $1"
    PASS=$((PASS+1))
  else
    echo "  [FAIL] $1 — found '$3' in $2"
    FAIL=$((FAIL+1))
  fi
}

check_content() {
  if grep -q "$3" "$2" 2>/dev/null; then
    echo "  [PASS] $1"
    PASS=$((PASS+1))
  else
    echo "  [FAIL] $1 — missing '$3' in $2"
    FAIL=$((FAIL+1))
  fi
}

VAULT="$HOME/obsidian/My-LLM-Wiki"
TEMPLATE="$HOME/project-wiki-template"
COMMANDS="$HOME/.claude/commands"

# --- Config ---
check_file "Config exists" "$HOME/.camp/config.json"

# --- Vault directories (core only, NO research) ---
check "Vault root exists" "[ -d '$VAULT' ]"
check "debugging/ exists" "[ -d '$VAULT/debugging' ]"
check "patterns/ exists" "[ -d '$VAULT/patterns' ]"
check "projects/ exists" "[ -d '$VAULT/projects' ]"
check "raw/ exists" "[ -d '$VAULT/raw' ]"
check_no_file "research/ does NOT exist" "$VAULT/research"
check_no_file "research/ai-papers/ does NOT exist" "$VAULT/research/ai-papers"

# --- Vault seed files (core only) ---
check_file "index.md" "$VAULT/index.md"
check_file "about-me.md" "$VAULT/about-me.md"
check_file "profile.md" "$VAULT/profile.md"
check_file "projects/my-projects.md" "$VAULT/projects/my-projects.md"
check_file "projects/_template.md" "$VAULT/projects/_template.md"
check_no_file "research/how-i-understood-things.md" "$VAULT/research/how-i-understood-things.md"

# --- No personal content ---
check_no_content "No hardcoded names in index.md" "$VAULT/index.md" "rafi"
check_no_content "No emails in profile.md" "$VAULT/profile.md" "@"
check_no_content "No research in index.md" "$VAULT/index.md" "research"
check_no_content "No how-i-understood in about-me.md" "$VAULT/about-me.md" "how-i-understood"

# --- Template files (all 7) ---
check_file "template project.md" "$TEMPLATE/project.md"
check_file "template rules.md" "$TEMPLATE/rules.md"
check_file "template context.md" "$TEMPLATE/context.md"
check_file "template architecture.md" "$TEMPLATE/architecture.md"
check_file "template decisions.md" "$TEMPLATE/decisions.md"
check_file "template progress.md" "$TEMPLATE/progress.md"
check_file "template ideas.md" "$TEMPLATE/ideas.md"

# --- Template paths replaced ---
check_no_content "template project.md has real path" "$TEMPLATE/project.md" "{{VAULT_PATH}}"

# --- Wiki commands (all 9) ---
for cmd in bug find ingest wiki-lint wiki-resume project-init project-init-ns dream end; do
  check_file "$cmd.md" "$COMMANDS/$cmd.md"
done

# --- Commands have real paths ---
check_no_content "bug.md has real vault path" "$COMMANDS/bug.md" "{{VAULT_PATH}}"
check_no_content "project-init.md has real template path" "$COMMANDS/project-init.md" "{{TEMPLATE_PATH}}"

# --- CLAUDE.md ---
check "CLAUDE.md exists" "[ -f '$HOME/CLAUDE.md' ]"
check_content "CLAUDE.md has LLM Wiki section" "$HOME/CLAUDE.md" "LLM Wiki"
check_no_content "CLAUDE.md has no placeholders" "$HOME/CLAUDE.md" "{{VAULT_PATH}}"

# --- _template.md has {{PROJECT_PATH}} placeholder ---
check_content "_template.md has PROJECT_PATH placeholder" "$VAULT/projects/_template.md" "{{PROJECT_PATH}}"

# --- No research references in commands ---
check_no_content "No how-i-understood in dream.md" "$COMMANDS/dream.md" "how-i-understood"
check_no_content "No research/ai-papers in ingest.md" "$COMMANDS/ingest.md" "research/ai-papers"

echo ""
echo "=========================================="
if [ $FAIL -eq 0 ]; then
  echo "  ALL $PASS TESTS PASSED"
else
  echo "  $PASS passed, $FAIL failed"
fi
echo "=========================================="

[ $FAIL -eq 0 ]