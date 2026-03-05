#!/usr/bin/env bash
# push.sh — Stage all changes, commit with a timestamp, and push to origin main.
# Usage:
#   ./push.sh                        # auto-generates commit message with timestamp
#   ./push.sh "your commit message"  # uses the message you provide

set -euo pipefail

BRANCH="main"
REMOTE="origin"
MSG="${1:-"chore: update docs [$(date -u '+%Y-%m-%d %H:%M UTC')]"}"

cd "$(git rev-parse --show-toplevel)"

if git diff --quiet && git diff --cached --quiet; then
  echo "Nothing to commit — working tree clean."
  exit 0
fi

git add -A
git commit -m "$MSG"
git push "$REMOTE" "$BRANCH"

echo "Pushed to $REMOTE/$BRANCH."
