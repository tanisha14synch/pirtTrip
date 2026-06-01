#!/usr/bin/env bash
# Create GitHub repo (if needed) and push. Requires: gh auth login
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPO_NAME="${1:-Pirt_trip}"
VISIBILITY="${2:-private}" # private | public

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: brew install gh"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Log in first:"
  echo "  gh auth login"
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "Pushing to existing origin..."
  git push -u origin main
  exit 0
fi

echo "Creating GitHub repo: $REPO_NAME ($VISIBILITY)"
gh repo create "$REPO_NAME" \
  --"$VISIBILITY" \
  --source=. \
  --remote=origin \
  --push \
  --description "Pirt Trip — group travel platform (Nuxt + Nitro + Supabase)"

echo "Done. View repo: $(gh repo view --json url -q .url)"
