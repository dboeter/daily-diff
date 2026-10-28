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
The digest published every day: AI Agents, AI Models & Labs, AI Policy and Data Engineering.

**Weekly Digest**:
The digest published once a week, alongside that day's Daily Digest: the Trends page.
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

**Tracked**:
The part of a daily page built from the lists in `config.yml` (projects, vendor feeds, legislative files, policy feeds) and the Anthropic and OpenAI sitemaps, with a quiet line on a day without news. Nothing moves from Spotted to Tracked without a config edit.

**Spotted**:
The part of a daily page holding the best community stories (Hacker News, Lobste.rs, Dev.to) that name no Tracked Project, routed to the page by topic and shown once.
_Avoid_: Discussions, Worth a Look

**Also talked about**:
The Overview's list of the day's most-discussed community stories whose topic (`other`) has no page: AI and work, security incidents. Policy stories, AI law in the news, have their own list beside it, **Policy talk**, with its own slots. Agents, models, research and data stories go to a page's Spotted instead.

**Policy talk**:
The Overview's list of the day's most-discussed policy-topic community stories, beside Also talked about and not competing with it for slots.

**Coming up**:
The dated items of the next 30 days: AI Policy's deadlines and calendar dates, the data page's Action required dates, Stealth Model expiries. All pages' items are listed on the Overview and in the Telegram message; AI Policy also ends with its own.

### Tracking

**Tracked Project**:
One named entry on a repo list in `config.yml` (Agents and Infra on the AI Agents page; Databricks, Snowflake and the open-source stack on Data Engineering), followed for its releases, hot issues and news whether or not its repo has any.
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
An open issue on a Tracked Project's repo that gained real engagement (comments plus 👍), or less on a regression or security issue, however old. The gain is the issue's comments and 👍 created in the window, counted without bots and bare slash commands; the rise since an earlier day's snapshot total, or a new issue's whole total, only caps it. A page shows it once.

**News Item**:
A community story (Hacker News, Lobste.rs, Dev.to) that names a Tracked Project, or a Tracked Project's own repo on GitHub Trending. Lab posts are not News Items.
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
An existing item whose usage jumped recently; not New, however steep the jump. Not marked: everything in the Trends page's agents tables is supposed to be rising.
_Avoid_: New, trending (for momentum alone)

**Trending**:
An item in the weekly Trends page's agents tables or Hugging Face table two weeks in a row or more, marked 🔥.
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
The kind of project an In Scope item is, which decides its table on the Trends page. There are five:

- **Coding Agent**: an agent that writes code.
- **Agent Harness & Framework**: a harness, SDK, framework or runtime for building agents.
- **Multi-Agent & Orchestration**: a system that runs and coordinates many agents.
- **Agent Tooling**: tooling built for agents, such as memory, context, skills, MCP servers or sandboxes.
- **Other Agent**: any other agent, such as a personal, research or browser agent.

**Standalone Tool**:
A product someone runs on its own: a CLI, IDE, app or cloud agent; plugins, MCP servers and proxies are not.
_Avoid_: Product, app (for this distinction)

**Radar**:
The Trends page's list of Standalone Tools worth watching this week, New or not, drawn from GitHub, OpenRouter and npm.
_Avoid_: New-agents list, watchlist

**Cross-source Match**:
The judgement that an OpenRouter app, an npm package and a repo are the same product.
_Avoid_: Match (bare), link
