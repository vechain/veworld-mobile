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

### ios nuke_appstore_certificates

```sh
[bundle exec] fastlane ios nuke_appstore_certificates
```

Revoke certificates from Apple Developer Portal

### ios remove_certificates_from_gh

```sh
[bundle exec] fastlane ios remove_certificates_from_gh
```

Remove certificates from GitHub

### ios generate_new_certificates

```sh
[bundle exec] fastlane ios generate_new_certificates
```

Generate new certificates

### ios fetch_certificates_from_gh

```sh
[bundle exec] fastlane ios fetch_certificates_from_gh
```

Get certificates

### ios fetch_certificates_from_gh_for_ci

```sh
[bundle exec] fastlane ios fetch_certificates_from_gh_for_ci
```

Get certificates

### ios rotate_certificates

```sh
[bundle exec] fastlane ios rotate_certificates
```

Rotate certificates

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

### ios gh_setup_before_ci

```sh
[bundle exec] fastlane ios gh_setup_before_ci
```

Create Release Branch on GitHub via CI

### ios gh_setup_after

```sh
[bundle exec] fastlane ios gh_setup_after
```

Commit latest artifacts to GitHub

### ios upload_source_maps

```sh
[bundle exec] fastlane ios upload_source_maps
```



### ios create_tags_gh

```sh
[bundle exec] fastlane ios create_tags_gh
```



### ios build

```sh
[bundle exec] fastlane ios build
```

Push a new beta build to TestFlight

### ios build_ci

```sh
[bundle exec] fastlane ios build_ci
```

Push a new beta build to TestFlight

### ios build_test_ci

```sh
[bundle exec] fastlane ios build_test_ci
```



----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
