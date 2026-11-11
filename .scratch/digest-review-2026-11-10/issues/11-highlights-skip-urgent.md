# 11: Highlights leave out the most urgent item of the page

Status: needs-triage
Findings: 13 [medium], see `../review.md`

## Problem

- Data, 2026-11-10: the Highlights lead with the Zhipu GLM 5.2 retirement of 2027-02-04. They do not name the Genie One MCP Beta endpoint, which stops answering on 2026-11-30, the nearest date in the Action required table. That row was opened by an earlier report, so it is not new today.
- Agents, 2026-11-10: the Highlights carry "Hermes Agent v0.23.1 raises plugin catalog cap to 16 MiB". They omit two fixes of Claude Code v2.1.321: MCP OAuth requests that sent secrets such as refresh tokens to another host after a redirect, and a read-only Bash command that ran outside the sandbox without a permission prompt. The release section also mixed up those fixes (issue 05).

The Highlights prompt asks for 1–3 bullets with one subject each, and gives no order of importance between a security fix, a deadline and a feature.

## Decide

- [ ] Whether a carried Action required row may be a Highlight when its date is near (for example within 30 days), given that Highlights are otherwise about what is new today
- [ ] Whether the Highlights prompt ranks a security fix and a near deadline above a feature, or code names them to the call as it names the no-Highlight rows
- [ ] Replay the two pages of 11-10 with the changed prompt before deciding

## Comments

- 2026-11-11: the maintainer chose a dedicated Security section on every page, incidents and fixes: `../../security-section/spec.md`. It takes the security fixes out of this issue; the near deadline (Genie One) stays here.
- 2026-11-11, later: the placement changed. There is no Security section: a security fix is a marked bullet in its project's release section, built after the story feed (`../../security-section/spec.md`, "Cost").
