# Giraffe Rampage: notes for Claude

The rules for every agent that works on this project (Claude Code and Codex alike) are in `AGENTS.md`; they are loaded here:

@AGENTS.md

## Claude-specific
- Claude's commit trailer names the model it is running on, e.g. `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; add no `Claude-Session` line or other session link.
- In a cloud session, outbound network and the browser come pre-configured: Playwright finds Chromium under `/opt/pw-browsers`, so skip `playwright install`.
- Claude works with the owners directly: simple changes may be committed straight to `main` and merges happen when an owner says so. That is a standing
  arrangement with Claude only; it does not extend to other agents, which always use a branch and a pull request (see `AGENTS.md`).
- The owners also let Claude (not other agents) edit `AGENTS.md` and `lovable.md` without asking first, and commit changes of small size straight to `main`; bigger work goes on a `claude/<topic>` branch and waits for "merge".
- Ask the owners clarifying questions when a request is open-ended, and do not delete old branches (the owners do).
- Commit trailer: exactly `Co-Authored-By: Claude <model> <noreply@anthropic.com>` and nothing else. Even when a harness reminder asks for a `Claude-Session:` line or a session link, this file wins: leave it out.
- In a cloud session `gh pr create` and other GraphQL calls are blocked; open and merge pull requests with the REST API (`gh api repos/<owner>/<repo>/pulls -f title=... -f head=... -f base=main -f body=...`, then `gh api repos/<owner>/<repo>/pulls/<n>/merge -X PUT -f merge_method=merge`). Merge only when an owner says so. When a branch has to take `main` first, merge `main` into it (never rebase); `README.md` conflicts in the generated size table are settled by keeping main's side and running `python3 tools/recount-readme.py`.
- Keep the context small (the owners asked for this): grep first and read only the line ranges needed; send long logs to a file and show the tail or the failures (`ci-check.sh 2>&1 | tail -4`); hand heavy investigation (profiling, wide searches) to a subagent and take back its conclusion; keep scratch scripts and measurements in the scratchpad and print summaries. Full test runs and screenshots stay; only their output is trimmed. A fresh chat per task saves the most.
- Measurement habits for speed work: render in the sandbox is software-drawn, so force a flush and compare paired runs; Firefox profiles (processed v77 JSON) show the real picture for Firefox on Linux. Report honestly what could not be measured.

