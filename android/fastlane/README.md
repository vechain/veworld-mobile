fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android rotate_keystore

```sh
[bundle exec] fastlane android rotate_keystore
```



### android bump_version

```sh
[bundle exec] fastlane android bump_version
```

bumps version with specific semantics or exacto version

### android create_changelog

```sh
[bundle exec] fastlane android create_changelog
```

Create changelog for Android

### android gh_setup_before

```sh
[bundle exec] fastlane android gh_setup_before
```

Create Release Branch on GitHub for Beta

### android gh_setup_after

```sh
[bundle exec] fastlane android gh_setup_after
```

Commit latest artifacts to GitHub

### android validate

```sh
[bundle exec] fastlane android validate
```

Validate the keystore and credentials

### android get_version_code

```sh
[bundle exec] fastlane android get_version_code
```

Get last version codes

### android get_version_name

```sh
[bundle exec] fastlane android get_version_name
```

Get last version name

### android build_android

```sh
[bundle exec] fastlane android build_android
```

Submit a new Beta Build to Play Store

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
