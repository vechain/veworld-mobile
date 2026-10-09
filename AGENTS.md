# VeWorld Mobile

## Architecture

### VechainWalletKit (`src/VechainWalletKit/`)

This folder is an **external library** that will be extracted to a standalone npm package. It MUST NOT import from any VeWorld application code. Specifically:

- No imports using `~` path aliases (`~Storage`, `~Model`, `~Components`, `~Hooks`, `~Utils`, `~Constants`, `~Navigation`, `~Screens`, `~Assets`, `~Api`, `~i18n`)
- Only relative imports within `src/VechainWalletKit/` and external npm packages are allowed
- The code inside can be modified, but it must remain usable as a standalone library
- VeWorld app code should consume VechainWalletKit through its public exports (`src/VechainWalletKit/index.ts`)
- Any integration between VechainWalletKit and VeWorld (e.g. syncing state to Redux) belongs in VeWorld wrapper components such as `src/Components/Providers/FeatureFlaggedSmartWallet.tsx`

## Commits & PRs

- **Prose bloat is a merge blocker.** [.github/workflows/pr-bloat.yml](.github/workflows/pr-bloat.yml) fails a PR on a description over 240 words (or under 10), a tool-attribution trailer, or a comment block that outweighs the code it documents (>1:1 against attached added-code lines; 10 lines absolute; a top-of-file header measures against the whole file). Comment density and long markdown paragraphs are advisory; `**/*.md` never blocks. `yarn check:pr-bloat` runs it locally. Bypass is the `verbose-ok` label, which anyone including the author may apply. Thresholds are env-overridable in [scripts/check-pr-bloat.mjs](scripts/check-pr-bloat.mjs). Dependency bots and the `vechain-ci` release PRs are skipped; agent-authored PRs from GitHub Apps are not.
- **Write reviewer-facing prose at final length — don't draft long and trim.** The budget is the target, not a limit to approach.
  - **PR descriptions:** what changed and why, in two or three sentences. Skip `## Summary` / `## Test plan` scaffolding unless there is genuinely something new to test. No tool-attribution trailers.
  - **Comments:** add one only where the WHY is non-obvious — a hidden constraint, an invariant, a workaround. A comment must not outweigh the code it documents; on a one-line field addition, that means no comment. JSDoc counts.
  - Don't restate what the code does, what a technical term already implies, or what a linked doc already says.
  - Don't explain what something does _not_ do. State what is; the reader can see the absence.
  - Real design rationale belongs in `docs/` with a link, not stacked above the code.
