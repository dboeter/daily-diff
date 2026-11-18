## Highlights
- Oh My Pi v18.20.3 ships breaking changes: removed public `isXdDevicePath` export, renamed `clickCount` to `count`, and viewport screenshot coordinates now use displayed image coordinates by default (use `css: true` for CSS pixels).
- A 27-byte unread telemetry response causes Claude Desktop on Linux to leak file descriptors until the renderer freezes every few days, discovered after a 1.5 TiB core dump.
- Attest framework introduces testing of AI agent behavior by verifying tool calls and state changes, with replay of recorded model responses and CI enforcement of checks.