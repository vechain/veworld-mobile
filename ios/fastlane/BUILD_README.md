# iOS Build

Build numbers come from TestFlight: each release uses the latest uploaded build plus one. The version defaults to the one in `package.json`; bump it in a PR to start the next version. Each release tags the commit it built as `v<version>-<build>` and commits nothing back.

Releases are built in CI only, because the distribution certificate lives in the `ios-release` environment. Run the **Release - iOS** workflow; it releases the version in `package.json` of the branch it runs on. Signing is described in [docs/release-secrets.md](../../docs/release-secrets.md#distribution-certificate).
