# Reading the digest

The reports are Markdown files in [`digests/`](../digests/). The same files are published as GitHub Issues and served through the channels below.

## Web UI

**[dboeter.github.io/daily-diff](https://dboeter.github.io/daily-diff)** renders the Markdown files through GitHub Pages, in dark or light. Each day opens on an overview of every report's highlights and what is coming up; the latest Weekly Diff and Trends pages stay pinned under **This week**.

## RSS feed

**[feed.xml](https://dboeter.github.io/daily-diff/feed.xml)** carries the latest 30 reports of every type. Each report also has its own feed, `feeds/<id>.xml` (e.g. [`feeds/ai-data.xml`](https://dboeter.github.io/daily-diff/feeds/ai-data.xml) for Data Engineering alone).

## MCP server

**`https://daily-diff-mcp.dboeter.workers.dev`** is a [Model Context Protocol](https://modelcontextprotocol.io) server (a Cloudflare Worker in `mcp/`) that reads the reports from GitHub Pages. Add it to any client as an HTTP MCP server, e.g. `claude mcp add --transport http daily-diff https://daily-diff-mcp.dboeter.workers.dev`.

| Tool           | Description                                         |
| -------------- | --------------------------------------------------- |
| `list_reports` | List available dates and report types (last N days) |
| `get_latest`   | Fetch the most recent report of a given type        |
| `get_report`   | Fetch a specific report by date and type            |
| `search`       | Keyword search across recent reports                |

The `Deploy MCP` workflow deploys it on pushes to `main` that touch `mcp/`; new digests need no deploy. By hand: `cd mcp && pnpm install && pnpm run deploy` (not `pnpm deploy`, which is pnpm's workspace command).

## Telegram and Teams

With `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` set, each run sends a Telegram message linking every report with its highlights, then up to 5 Coming up items. With `TEAMS_WEBHOOK_URL` set, the Data Engineering highlights go to a Teams channel as an Adaptive Card. Either one unset is skipped silently.
