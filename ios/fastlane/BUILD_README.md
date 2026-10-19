# iOS Build

Build numbers come from TestFlight: each release uses the latest uploaded build plus one. The version defaults to the one in `package.json`, which each release's artifacts PR updates.

### Build for internal consumption

On the terminal inside the ios directory:

```bash
fastlane build username:<your github username> token:<your personal access token>
```

### Build a new version

```bash
fastlane build username:<your github username> token:<your personal access token> version:<"patch", "minor", "major" or "1.0.0">
```

In CI, run the **Release - iOS** workflow. Leave the version empty to release the current one.
