# Daily Diff

A digest generator for the AI coding-agent ecosystem: it turns releases, issues and news from the AI open-source world into reports a maintainer can read in one sitting.

## Language

### Publication

**Run**:
One execution of the pipeline, scheduled or manual.
_Avoid_: Job, build

**Weekly Run**:
A run that also produces the Weekly Digest.

**Digest**:
The set of reports of one cadence published for one day; there is a Daily Digest and, on the weekly day, a separate Weekly Digest.
_Avoid_: Edition, run output

**Daily Digest**:
The digest published every day: Agents, Discussions, ArXiv and Web.

**Weekly Digest**:
The digest published once a week, alongside that day's Daily Digest: Trending and Models. The same run adds Dev.to and Lobste.rs to that day's Discussions report.
_Avoid_: Weekly rollup (the retired summary of a week's daily digests)

**Report**:
One titled document within a digest, covering a single source or topic.
_Avoid_: Digest (for a single report), summary

**Window**:
The time range a report's data covers.
_Avoid_: Period (kept only as the reader-facing label, e.g. "today")

**Summary**:
The text the LLM writes inside a report, as opposed to the parts rendered without it.
_Avoid_: Report

**Failure Notice**:
The fixed text that stands in for a summary the LLM failed to produce; not the same as a Quiet project.
_Avoid_: Placeholder

**Highlights**:
The few items from a digest picked for the notification message and the web UI's day Overview. Not the `## Highlights` section a report opens with, which is part of its Summary.
_Avoid_: Summary, brief

**Overview**:
The web UI page for one day: each report's Highlights under a link to the report.

**Report Bar**:
The line under a report's title linking the day's Overview and its other reports.
_Avoid_: Nav, menu

### Tracking

**Tracked Project**:
One named entry on the Agents or Infra list (the two sections of the Agents report), followed for its releases, hot issues and news whether or not its repo has any.
_Avoid_: Repo, agent (for a list entry)

**Repo**:
The GitHub repository a Tracked Project or a trending row points at.
_Avoid_: Project (for the repository itself)

**Release**:
A stable release of a Tracked Project.
_Avoid_: Release (for a prerelease)

**Prerelease**:
A nightly, alpha, beta, release candidate, preview or canary build, whatever its publisher flags it as.
_Avoid_: Release, preview

**Hot Issue**:
An issue on a Tracked Project's repo with real engagement (comments plus 👍), or less engagement on a regression or security issue, however old.

**News Item**:
An HN story, web post or trending repo that names a Tracked Project.
_Avoid_: Mention

**News Match**:
The link between a News Item and the Tracked Project it names.
_Avoid_: Match (bare)

**Vendor Feed**:
A data platform's release notes (Databricks, Snowflake, Azure / Fabric, BigQuery) read by the data report, one item per note; a Snowflake behavior-change bundle is one item that returns when its status moves.
_Avoid_: Blog, vendor news

**Quiet**:
A Tracked Project with nothing worth reporting for the window, whether nothing happened or what happened was noise; a project that could not be checked is not Quiet.
_Avoid_: Inactive, idle

**Stealth Model**:
An unannounced model offered anonymously on OpenRouter under a code name, before its maker reveals it.
_Avoid_: Cloaked model, anonymous model

### Trending

**New**:
An item that first appeared in the ecosystem recently, marked 🆕.
_Avoid_: Fresh, hot (for an item that was already around)

**Rising**:
An existing item whose usage jumped recently; not New, however steep the jump. Not marked: everything in the trending report is supposed to be rising.
_Avoid_: New, trending (for momentum alone)

**Trending**:
An item in the weekly trending report two weeks in a row or more, marked 🔥.
_Avoid_: Hot, popular (for a first appearance or a one-week jump)

**Established Repo**:
A repo that is not New; only Established Repos appear in the category tables.

**Star Gain**:
The stars a repo gained in the last 7 days.
_Avoid_: Momentum

**Relative Gain**:
A repo's Star Gain divided by its stars a week earlier.

**In Scope**:
A trending item that belongs in one of the Categories; any other item is Out of Scope.
_Avoid_: Relevant, irrelevant

**Category**:
The kind of project an In Scope item is, which decides its table in the Trending report. There are five:

- **Coding Agent**: an agent that writes code.
- **Agent Harness & Framework**: a harness, SDK, framework or runtime for building agents.
- **Multi-Agent & Orchestration**: a system that runs and coordinates many agents.
- **Agent Tooling**: tooling built for agents, such as memory, context, skills, MCP servers or sandboxes.
- **Other Agent**: any other agent, such as a personal, research or browser agent.

**Standalone Tool**:
A product someone runs on its own: a CLI, IDE, app or cloud agent; plugins, MCP servers and proxies are not.
_Avoid_: Product, app (for this distinction)

**Radar**:
The Trending report's list of Standalone Tools worth watching this week, New or not, drawn from GitHub, OpenRouter and npm.
_Avoid_: New-agents list, watchlist

**Cross-source Match**:
The judgement that an OpenRouter app, an npm package and a repo are the same product.
_Avoid_: Match (bare), link
