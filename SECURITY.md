# Security policy

## Supported versions

Daily Diff has no releases. Only the `main` branch, the published site and the MCP server (`mcp/`) get security fixes.

## Report a vulnerability

Do not open a public issue. Report it privately through GitHub: go to the [Security tab](https://github.com/dboeter/daily-diff/security) and click **Report a vulnerability**.

Please include:

- what is affected (the pipeline, a workflow, the web UI, the MCP server, or a dependency),
- how to reproduce it,
- what an attacker could do with it.

This is a one-person project. Expect a first reply within 7 days. When a fix ships, the advisory is published and you are credited, unless you ask not to be.

## In scope

- Secrets leaking from the GitHub Actions workflows or the logs (API keys, tokens, webhook URLs).
- Content from a fetched source (a feed, a story, a release note) that runs script in the web UI or changes what the pipeline does.
- The MCP server in `mcp/`.

## Out of scope

- Wrong, misleading or missing content in a digest. Those are content errors: open an issue or a pull request.
- Vulnerabilities in the projects the digest reports on. Report those to that project.
