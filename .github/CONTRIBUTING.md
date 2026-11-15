# Contributing

Thanks for helping. Daily Diff is a small project with one maintainer, so a short pull request with a clear reason is the easiest to review.

## Before you start

- **GitHub Issues hold the published digests.** Each day's reports are opened as issues by the daily workflow. You can still open an issue for a bug or a proposal: give it a clear title, so it does not get lost among the digests.
- **Tracked projects live in `config.yml`.** To propose a repo for a section, add it there with a comment on why it fits, then run `pnpm readme` to update the README's tables.
- **Security problems go through the [security policy](SECURITY.md)**, never a public issue.

## Set up

You need Node.js and pnpm (the version is in `package.json` under `packageManager`).

```bash
pnpm install
cp .env.example .env   # add the keys you have; every source degrades without its key
pnpm start             # run the full digest locally
```

`AGENTS.md` explains the pipeline, the state files and the environment variables. Read it before a larger change.

## Make a change

1. Branch from `main`.
2. Follow `CODING_STANDARDS.md`.
3. Add or update tests for a behavior change. Tests mirror `src/` under `src/__tests__/`.
4. If your change alters behavior that `AGENTS.md`, `README.md` or a comment describes, update that text in the same change.
5. Run the checks. The pre-commit hook runs most of them:

   ```bash
   pnpm lint
   pnpm format:check
   pnpm typecheck
   pnpm test
   pnpm readme --check
   ```

6. Open a pull request against `main`. Say what changed and why. CI runs the same checks.

## Do not commit

- `.env` or any API key.
- Files under `digests/` from a local run. The daily workflow writes them.

## Conduct

Everyone who takes part follows the [code of conduct](CODE_OF_CONDUCT.md).
