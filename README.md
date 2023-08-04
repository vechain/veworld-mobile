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
- Xcode - v14.3.1
```

**Android**

```
- JDK - zulu11
- Android Studio
```

# Run the project

The first time you clone the repo you need to do:

```js
- yarn install
- bundle install
- npx pod-install
- cp .env.local.example .env.local
```

then on every other time:

### iOS

```js
- yarn start
- yarn ios
```

### Android

```js
- yarn start
- yarn android
```

Follow the official React Native [documentation](https://reactnative.dev/docs/environment-setup) for detailed explenation and additional steps.

# MAC OS X - M2 Processors additional setup

When configuring the WeWorld mobile app for Android on a MAC with an M2 processor you should also make sure that Rosetta 2 is installed.

If Rosetta is not installed, you can install it by running:

```
softwareupdate --install-rosetta
```

#

# Git Conventions

### Convential commits

Read more [here](./docs/conventioanl_commits.md)

# Testing

This project uses [Detox](https://wix.github.io/Detox/docs/introduction/getting-started/) for E2E tests. Read more [here](./docs/detox.md)

# Translation

-   To add new translation strings just add them to `src/i18n/en/index.ts` or any other language that you need i.e. `src/i18n/it/index.ts`.

-   To add a new language add a new directory in `src/i18n` and name the folder with the desired language code i.e. `src/i18n/es` for spanish.



# Troubleshooting

-   **dlopen failed: library "libexpo-av.so" not found (Android)**: This error can rise when node has not been installed using either Brew or NVM. To solve the issue, reinstall node using one of these two methods and build again the app.
-   **NDK at ~/Library/Android/sdk/ndk did not have a source.properties file (Android)**: To solve this error just delete the NDK folders in the above path and run the build again. The NDKs will be downloaded and read properly.


