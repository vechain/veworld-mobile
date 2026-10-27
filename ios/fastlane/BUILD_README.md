# iOS Build

Build numbers come from TestFlight: each release uses the latest uploaded build plus one. The version defaults to the one in `package.json`, which each release's artifacts PR updates.

Releases are built in CI only, because the distribution certificate lives in the `ios-release` environment. Run the **Release - iOS** workflow, leaving the version empty to release the current one or giving `patch`, `minor`, `major` or an explicit version. Signing is described in [docs/release-secrets.md](../../docs/release-secrets.md#distribution-certificate).
