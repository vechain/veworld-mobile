<img src="docs/img/banner.png" alt="banner" style="width: 100%; display: block; padding: 0 0 30px;" />

🌐 Official website: [Website](https://vechain.org/)<br/>
🏠 VeWorld website: [Website](https://veworld.net/)<br/>
📚 VeChain [Documentation](https://docs.vechain.org/)<br/>
❓ Have questions? Reach out to one of our community channels below!

<p align="center" style="padding: 0 0 30px;">
    <a href="https://discord.gg/vechain"><img src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" /></a>
    <a href="https://t.me/vechainandfriends"><img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" /></a>
    <a href="https://www.reddit.com/r/Vechain"><img src="https://img.shields.io/badge/Reddit-FF4500?style=for-the-badge&logo=reddit&logoColor=white"/></a>
</p>

#

<div align="center">
    <h1>VeWorld - Vechain's Mobile Crypto Wallet</h1>
    <p>
        <a href="https://github.com/vechain/veworld-mobile/actions/workflows/scan-workflows.yaml"><img src="https://github.com/vechain/veworld-mobile/actions/workflows/scan-workflows.yaml/badge.svg?branch=main&event=push" alt="Zizmor Checks"></a>
        <a href="https://sonarcloud.io/summary/new_code?id=vechain_veworld-mobile">
        <img src="https://sonarcloud.io/api/project_badges/measure?project=vechain_veworld-mobile&metric=alert_status&token=2336ef9bce4fb960e3727ebb94acfbbfc4229d6b" alt="Quality Gate Status"></a>
        <a href="https://sonarcloud.io/project/overview?id=vechain_veworld-mobile">
        <img src="https://sonarcloud.io/api/project_badges/measure?project=vechain_veworld-mobile&metric=security_rating&token=2336ef9bce4fb960e3727ebb94acfbbfc4229d6b" alt="Security Rating"></a>
        <a href="https://sonarcloud.io/project/overview?id=vechain_veworld-mobile">
        <img src="https://sonarcloud.io/api/project_badges/measure?project=vechain_veworld-mobile&metric=vulnerabilities&token=2336ef9bce4fb960e3727ebb94acfbbfc4229d6b" alt="Maintainability Rating"></a>
        <a href="https://github.com/vechain/vechain-veworld-mobile/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
    </p>
</div>

VeWorld is an open-source crypto wallet for interacting with the Vechain blockchain. It supports viewing token balances and NFTs, executing transactions, connecting Ledger hardware wallets, and interacting with the VeBetterDAO ecosystem and other VeChain dApps

# Prerequisites

The versions are pinned in the repo's dotfiles. If this table and a dotfile disagree, the dotfile is correct.

| Tool           | Version      | Pinned in                         |
| -------------- | ------------ | --------------------------------- |
| Node           | 20.19.0      | `.nvmrc`                          |
| Yarn           | 1.22.x       | `package.json` (`packageManager`) |
| Ruby (iOS)     | 3.2.6        | `.ruby-version`                   |
| Java (Android) | Azul Zulu 17 | `.java-version`                   |
| Xcode (iOS)    | 26.2         | CI (`release-ios.yml`)            |
| Watchman       | latest       |                                   |

```bash
brew install watchman rbenv   # then follow the instructions printed by `rbenv init`, and open a new terminal
rbenv install                 # installs the version in .ruby-version; `ruby -v` should now print 3.2.6
brew install --cask zulu@17   # then: export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

You can run the unit tests without Xcode or Android Studio: run `yarn install:android`, then `yarn test`.

# iOS

### 1. Install Xcode 26.2 and point the command line tools at it

Use the Xcode version CI uses. Xcode 27 builds the app, but iOS 27 stops it at launch because VeWorld doesn't use the UIScene lifecycle yet. You can install Xcode 26.2 alongside a newer Xcode:

```bash
brew install xcodes
xcodes install 26.2 --select   # asks for your Apple ID and sets xcode-select to Xcode 26.2
```

### 2. Create the Sentry config

Sentry isn't used during development, but the build needs this file to exist:

```bash
echo -e "defaults.url=https://sentry.io/\ndefaults.org=vechain-foundation\ndefaults.project=veworld-mobile" > ios/sentry.properties
```

### 3. Install dependencies

Run these from the repo root:

```bash
(cd ios && bundle install)   # installs CocoaPods 1.16.2, the version CI uses
yarn install:all             # installs JS dependencies, generates code and installs pods
```

### 4. Run on the simulator

```bash
yarn start   # terminal 1: Metro
yarn ios     # terminal 2
```

`yarn ios` launches the `iPhone 17 Pro` simulator, a default simulator in Xcode 26. To use a different one, set `IOS_SIMULATOR`, for example `IOS_SIMULATOR="iPhone 17" yarn ios`. `xcrun simctl list devices available` lists the simulators you have. To create a missing one, such as the SE that `yarn ios:old-device` uses:

```bash
xcrun simctl create "iPhone SE (3rd generation)" com.apple.CoreSimulator.SimDeviceType.iPhone-SE-3rd-generation
```

To build from Xcode instead, open `ios/VeWorld.xcworkspace`. Don't open `VeWorld.xcodeproj`, because it doesn't include the pods. Pick the **VeWorld** scheme and a simulator, then press ⌘R while `yarn start` is running.

The project sets a development team only for device builds, so try the simulator before changing any signing settings. If Xcode reports _Signing for "VeWorld" requires a development team_, follow step 5.

### 5. Signing (for physical devices, or if Xcode asks)

1. Add your Apple ID under **Accounts** in Xcode's Settings.
2. In the Project navigator, select the **VeWorld** project. Then select the **VeWorld** target (under TARGETS, not PROJECT) and open **Signing & Capabilities** → **All**.
3. Tick **Automatically manage signing**, choose your **Team**, and set a unique **Bundle Identifier**, for example `org.vechain.veworld.app.<your-name>`.

    ![Signing](docs/img/Xcode.png)

4. In the **iCloud** capability, untick `iCloud.org.vechain.veworld.app` and add `iCloud.<your bundle id>`.

    ![iCloud](docs/img/cloudkit.png)

5. Repeat steps 3 and 4 for the **OneSignalNotificationServiceExtension** target, using the bundle ID `<your bundle id>.OneSignalNotificationServiceExtension`.

Free personal teams don't support some of the app's capabilities, such as iCloud and Push Notifications. Xcode shows these in red, and you can delete them locally.

Don't commit these changes. To undo them:

```bash
git restore ios/VeWorld.xcodeproj/project.pbxproj ios/VeWorld/VeWorld.entitlements ios/OneSignalNotificationServiceExtension/OneSignalNotificationServiceExtension.entitlements
```

> **Note:** With your own iCloud container, the logs show _Couldn't get container configuration from the server for container_. This only affects iCloud backup. To test it, set up the records with the **CloudKit Console** button in the iCloud capability.

# Android

### How Run the project

This project is using soe external services that are not neccesary during development, but in this moment some configuration files are needed in order to make it run. In order to generate these files do the following.

##

From the project root open your terminal and type the following:

```bash
cd android

echo -e "storePassword=mockvalue\nkeyPassword=mockvalue\nkeyAlias=mockvalue\nstoreFile=./release.keystore" > keystore.properties

keytool -genkeypair -v -keystore release.keystore -alias mockvalue -keyalg RSA -keysize 2048 -validity 10000 -storepass mockvalue -keypass mockvalue -dname "CN=Mock, OU=Mock, O=Mock, L=Mock, ST=Mock, C=US"
```

Then type the following on your terminal:

`yarn install:all`

`yarn start`

Then open a new instance of the terminal on the project root and type:

`yarn android:emus`

to select an android emulator to run the app (you need to have at least once active emulator on your android studio).

# How to contribute

## Merge Request Acceptance Criteria

In order to submitng a merge request please do the following:

1. `fork` the repo,
2. create a branch from `main` using the following convention for naming it.
3. Before opening a merge request create an issue if there isn't one already opened.

### Branch naming

Name your branch using the following convention:

### Feature

`feat-<branch name here>`

### Bug

`bug-<branch name here>`

Then open a merge request pointing to this repo's `main` branch. Please follow the merge request template when submitting.

### Commit Messages

This project uses conventional commits format for commit messages. Please use this when you submit a merge request.

Read more [here](./docs/conventional_commits.md)

### Testing

You are not required to write any tests, although new tests are always welocome :) but please make sure that current tests are passing on the CI phase and are not failing.

### Merge Request

Please add a video screen recording of the UI/UX flow or a screenshot of your device/simulator if the merge request contains changes in the UI/UX flow.

#

# Translations

### Generate the i18n language files

To generate the i18n files for every language,
create a `.env.local` file with the open ai key:

```
OPENAI_API_KEY=<your_openai_api_key>
```

and then run `yarn i18n:generate`

### Generate the i18n types

to only generate the i18n types run:

```bash
yarn i18n:types
```

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

#

# E2E

This project uses Maestro for E2E tests. Read more [here](https://maestro.mobile.dev/)(https://maestro.mobile.dev/cli/cloud)
Simple setup. Maestro is a single binary that works anywhere.

Step 1: Install Maestro
To get started with Maestro, install it using the following command:
curl -Ls "https://get.maestro.mobile.dev" | bash

To upgrade the Maestro CLI:
curl -Ls "https://get.maestro.mobile.dev" | bash

Step 2: Prepare the Environment

On the `.env.local` file, paste this two lines and replace `<e2e_mnemonic>` with your mnemonic

```bash
# maestro test
IS_CI_BUILD_ENABLED="true"
E2E_MNEMONIC="<e2e_mnemonic>"
```

#### Android Emulator Setup

Step 1: Prepare the Environment

1. Navigate to your platform tools directory:
   cd `/Users/<username>/Library/Android/sdk/platform-tools`

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

1.  List iOS devices:
    xcrun simctl list (List of ios devices with device ids)

2.  Boot an iOS device:
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


# Deployments
The deployment process is automated for both Andorid and iOS.
Every evening release-overnight.yaml is ran to check if there was any new PRs merged into main in the past day if so then the release process is kicked off for both operating systems. The release artifacts are then uploaded to the relevant app stores ready for testing and further release to end users.
