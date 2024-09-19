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

This project uses Maestro for E2E tests. Read more [here](https://maestro.mobile.dev/)(https://maestro.mobile.dev/cli/cloud)
Simple setup. Maestro is a single binary that works anywhere.

Step 1: Install Maestro
To get started with Maestro, install it using the following command:
 curl -Ls "https://get.maestro.mobile.dev" | bash

To upgrade the Maestro CLI:
 curl -Ls "https://get.maestro.mobile.dev" | bash

Step 2: Prepare the Environment

On the `.env.local` file, that you can find in 1Password you need to paste this two lines and replace the `<e2e_mnemonic>` with the one you find in 1Password

```bash
# maestro test
IS_CI_BUILD_ENABLED="true"
E2E_MNEMONIC="<e2e_mnemonic>"
```

#### Android Emulator Setup

Step 1: Prepare the Environment
1. Navigate to your platform tools directory:
 cd /Users/<username>/Library/Android/sdk/platform-tools

2. Install adb

3. Open Android Studio

4. Start an emulator
   ./adb devices
You should see an emulator listed.

Step 2: Generate and Install the APK
1. Generate the APK Locally:
  yarn purge
  yarn install:all
  yarn e2e.android.build.d

2. Start the Metro builder:
   yarn start:test

3. Install the APK on the emulator:
   ./adb -s emulator-5554 install ../veworld-mobile/android/app/build/outputs/apk/debug/app-debug.apk

Step 3: Execute Tests
Run the flow.yaml file to start the test:
 maestro test .maestro (This command looks for the config file in the .maestro folder and picks the flows for execution.)

Uninstall the App (if needed):
 ./adb -s <emulator_id> uninstall org.vechain.veworld.app

#### iOS emulator Setup

Step 1: Prepare the Environment
 1. List iOS devices:
   xcrun simctl list (List of ios devices with device ids)

 2. Boot an iOS device:
   xcrun simctl boot <device_id>

 Step 2: Generate and Install the App
  1. Generate the iOS App Locally:
     yarn purge
     yarn install:all
     yarn e2e.ios.build.d

  2. Start the Metro builder:
     yarn start:test

  3. Install the App:
     xcrun simctl install <device_id> <ios_app_location>

 Step 3: Execute Tests
  1. Run tests:
     maestro test .maestro

   2. Uninstall the App (if needed):
      xcrun simctl uninstall <device_id> org.vechain.veworld.app

For any issues or further assistance, please refer to the Maestro documentation(https://maestro.mobile.dev/)
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

Before starting the release process remember to comment or delete this two variables in the `.env.local`

```bash
# maestro test
# IS_CI_BUILD_ENABLED="true"
# E2E_MNEMONIC="<e2e_mnemonic>"
```

the release process is automated via Fastlane:

[IOS build](./ios/fastlane/BUILD_README.md)

[Android build](./android/fastlane/BUILD_README.md)

# Troubleshooting

-   **dlopen failed: library "libexpo-av.so" not found (Android)**: This error can rise when node has not been installed using either Brew or NVM. To solve the issue, reinstall node using one of these two methods and build again the app.
-   **NDK at ~/Library/Android/sdk/ndk did not have a source.properties file (Android)**: To solve this error just delete the NDK folders in the above path and run the build again. The NDKs will be downloaded and read properly.
-  **can't find gem fastlane (>= 0.a) with executable fastlane (Gem::GemNotFoundException)**
To solve this error when you run the fastlane command to create the app build you can try to run: 
   - Building for Android: `bundle exec fastlane build_android` and will check for all the gem dependencies, if something is missing you can run `build install` to install them.
   - Building for iOS : `bundle exec fastlane build` and will check for all the gem dependencies, if something is missing you can run `build install` to install them.
