# Labelling rubric (frozen 2026-11-11, before any label or Jev call)

## Stories (`stories.json`: title, description, site)

- `yes`: the story reports a specific security or privacy event that concerns an AI tool, an AI model provider or AI service, or a data platform or data tool. One of:
  - `incident`: a breach, hack, leak or exposure of data, secrets or personal data; a malicious or compromised package or extension.
  - `vulnerability`: a concrete flaw disclosed in a named product, or an exploit shown against a named product, with no breach reported.
  - `fix`: a patch, postmortem, vendor statement or remediation guide for such an event.
- `no`: everything else. That includes research papers and general essays on a class of attack with no event in a named product; new security tools, scanners, sandboxes and audit products; AI safety, alignment, misuse, deepfakes, moderation, policy and law; security news that does not concern AI or data tooling; a bug or outage with no security or privacy effect; a model made for cyber work.
- `borderline`: only when the title and description do not allow a decision.
- For a `yes`, also `severe`: `yes` when users of the product should act now (update, uninstall, rotate credentials), or data of many users was exposed; else `no`.

## Release-note lines (`lines-sample.json`: project, tag, line)

- `yes`: the line describes a change with a security or privacy effect: it fixes a vulnerability; stops a leak or an unintended sending of secrets, credentials or personal data; fixes a permission, sandbox, deny-rule or authentication bypass; adds a protection or check against one of these; or bumps a dependency for a CVE.
- `no`: everything else. That includes a new option or convenience around permissions, login or tokens that describes no flaw and no new protection, and every use of "token" for model tokens.
- `borderline`: only when the line does not allow a decision.
