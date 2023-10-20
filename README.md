# veworld-mobile

# Environment setup

I order to run this project install the following dependencies:

**Global Dependencies**

```
- Homebrew
- Node - v18.12.1
- Ruby - v2.7.5
```

**Platform specific**

iOS:

Download Xcode form the Mac AppStore

```
- Xcode - v15
```

**Android**

```
- JDK - zulu11
- Android Studio
```

# Run the project

The first time you clone the repo you need to:

copy env files into the repo

then install all the dependencies and pods:

```bash
- yarn install:all
```

### Run the metro bundler

```bash
- yarn start
```

or run it with i18n compiler

```bash
- yarn start:i18n
```

### iOS

```bash
- yarn ios
```

### Android

```bash
- yarn android
```

Follow the official React Native [documentation](https://reactnative.dev/docs/environment-setup) for detailed explanation and additional steps.

# MAC OS X - M2 Processors additional setup

When configuring the WeWorld mobile app for Android on a MAC with an M2 processor, you should also make sure that Rosetta 2 is installed.

If Rosetta is not installed, you can install it by running:

```
softwareupdate --install-rosetta
```

#

# Git Conventions

### Convential commits

Read more [here](./docs/conventional_commits.md)

# Testing

### Unit test

to run unit tests:

```bash
yarn test
```

to check unit test coverage:

```bash
yarn test:coverage
```

### E2E

This project uses [Detox](https://wix.github.io/Detox/docs/introduction/getting-started/) for E2E tests. Read more [here](./docs/detox.md)

# Translation

-   To add new translation strings just add them to `src/i18n/en/index.ts` or any other language that you need i.e. `src/i18n/it/index.ts`.

-   To add a new language add a new directory in `src/i18n` and name the folder with the desired language code i.e. `src/i18n/es` for spanish.

to watch i18n changes run:

```bash
yarn i18n
```

to watch i18n changes and starting the metro bundler:

```bash
yarn start:i18n
```

# Deploy

### Release

the release process is automated via Fastlane:

[IOS build](./ios/fastlane/BUILD_README.md)

[Android build](./android/fastlane/BUILD_README.md)

# Troubleshooting

-   **dlopen failed: library "libexpo-av.so" not found (Android)**: This error can rise when node has not been installed using either Brew or NVM. To solve the issue, reinstall node using one of these two methods and build again the app.
-   **NDK at ~/Library/Android/sdk/ndk did not have a source.properties file (Android)**: To solve this error just delete the NDK folders in the above path and run the build again. The NDKs will be downloaded and read properly.


