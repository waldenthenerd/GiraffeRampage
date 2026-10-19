# Giraffe Rampage: notes for Claude

The rules for every agent that works on this project (Claude Code and Codex alike) are in `AGENTS.md`; they are loaded here:

@AGENTS.md

## Claude-specific
- Claude's commit trailer is `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; add no `Claude-Session` line.
- In a cloud session, outbound network and the browser come pre-configured: Playwright finds Chromium under `/opt/pw-browsers`, so skip `playwright install`.
- Claude works with the owners directly: simple changes may be committed straight to `main` and merges happen when an owner says so. That is a standing
  arrangement with Claude only; it does not extend to other agents, which always use a branch and a pull request (see `AGENTS.md`).
- Ask the owners clarifying questions when a request is open-ended, and do not delete old branches (the owners do).
