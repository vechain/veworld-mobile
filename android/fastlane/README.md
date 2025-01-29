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

### android validate

```sh
[bundle exec] fastlane android validate
```

Validate the keystore and credentials

### android upload_sourcemaps_sentry

```sh
[bundle exec] fastlane android upload_sourcemaps_sentry
```

Upload source maps to Sentry using token from sentry.properties

### android build_android

```sh
[bundle exec] fastlane android build_android
```

Submit a new Beta Build to Play Store

### android build_android_ci

```sh
[bundle exec] fastlane android build_android_ci
```

Submit a new Beta Build to Play Store

### android build_test_ci

```sh
[bundle exec] fastlane android build_test_ci
```



----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
