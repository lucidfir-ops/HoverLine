# Agents and task allocation

Read `CLAUDE.md` first: it has the build, test and handoff rules every agent follows. This file says how work is split
by difficulty and who does it. The agent definitions are in `.claude/agents/`.

## Tiers

| Agent | Model | Effort | Give it | Examples |
| --- | --- | --- | --- | --- |
| `quick-fixer` | Haiku | low | A change of a few lines with an obvious right answer and an easy check. One file or two. | Change a timer, a duration, a colour; rename a label. |
| `feature-builder` | Sonnet | medium | A contained feature or fix in one area of the code, with a clear spec: new module, an AI behaviour, a UI screen, a style pass. | Reflector module; AI swerves in smoke; style-guide audit. |
| `architect` | Opus | high | Work that crosses areas, changes how tracks are generated or how the game is structured, or needs real design judgement and testing. | New track features (drops, jumps, upside-down road); split screen and phones as controllers; Prism geometry holes. |
| `designer` | Opus | high | Creative work with no code, or code only to render: dossiers, art direction, cover art. | Spirit realm dossier; cover art from the new frames. |
| `tester` | Sonnet | medium | Checks another agent's finished work: builds, runs the tests, renders and looks, reports what fails. Never fixes. | After any task, before merging. |

How to choose: start from the lowest tier that can do it well. Move a task up a tier when it touches more than one area
(`track/`, `race/`, `net/`...), when balance needs the simulator, when a mistake would break races or saves, or when it
needs taste. Move it down when the spec is exact. Split big tasks so each part fits one tier.

## Order

1. Shared groundwork first (docs, style guide), since other tasks depend on it.
2. Then tasks in parallel, but never two at once in the same files. Tasks in the same area run one after another,
   in the same agent where possible.
3. Every task goes to `tester` before it is merged; failures go back to the agent that did it.
4. The lead merges, does the version and changelog step (CLAUDE.md step 5), builds and hands over.

## Rules for task agents

- Work in your own worktree and branch; commit there with a clear message. Don't push; the lead merges.
- Don't edit `CHANGELOG.md`, `docs/DESIGN.md`, `docs/PLAN-*.md`, the Prototype number, `logShare`'s `v` or `BOARD_ERA`.
  Instead end your report with a short "Changelog:" paragraph written for Eric (plain, what changed and why) and say
  whether the change affects race times (so the lead can decide on `BOARD_ERA`).
- Keep to `STYLE.md`. Add a comment headed `Prototype 60:` on new code explaining why, as the codebase does.
- Before you report: `python3 tools/build.py`, `python3 tools/check.py`, the tests for your area and any new test you
  wrote. Report what passed, what you could not test (for example, how something feels on the Deck), and the commit.
