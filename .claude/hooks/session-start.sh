#!/bin/bash
# Claude Code cloud sessions: make the QA runner ready (npm packages for tools/qa-cloud.mjs, and Chromium) so a scenario can be run straight away.
# Safe to run again. Only runs in a cloud session.
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}/tools"
npm install --no-audit --no-fund --loglevel=error
pw="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"
if ! ls "$pw"/chromium-* >/dev/null 2>&1; then npx playwright install --with-deps chromium; fi
echo "QA runner ready: $(node -v), playwright $(node -p "require('playwright/package.json').version" 2>/dev/null || echo '?')"
