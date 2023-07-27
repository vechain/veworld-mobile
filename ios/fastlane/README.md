fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios e2e

```sh
[bundle exec] fastlane ios e2e
```

Run e2e tests

### ios create_changelog

```sh
[bundle exec] fastlane ios create_changelog
```

Create changelog

### ios gh_setup_before

```sh
[bundle exec] fastlane ios gh_setup_before
```

Create Release Branch on GitHub for Beta

### ios gh_setup_after

```sh
[bundle exec] fastlane ios gh_setup_after
```

Commit latest artifacts to GitHub

### ios build

```sh
[bundle exec] fastlane ios build
```

Push a new beta build to TestFlight

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
