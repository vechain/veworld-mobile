# iOS

### How Run the project

From the project root open your terminal and type the following:

```bash
cd ios

echo -e "defaults.url=https://sentry.io/\ndefaults.org=vechain-foundation\ndefaults.project=veworld-mobile" > sentry.properties
```

Then in Xcode add your account and a new `Bundle Id` for the project

![Xcode](docs/img/Xcode.png)

Then type the following on your terminal:

`yarn install:all`

`yarn start`

Then open a new instance on the project root and type:

`yarn ios`

#

# Android

### How Run the project

From the project root open your terminal and type the following:

```bash
cd android

echo -e "storePassword=mockvalue\nkeyPassword=mockvalue\nkeyAlias=mockvalue\nstoreFile=./release.keystore" > keystore.properties

keytool -genkeypair -v -keystore release.keystore -alias mockvalue -keyalg RSA -keysize 2048 -validity 10000 -storepass mockvalue -keypass mockvalue -dname "CN=Mock, OU=Mock, O=Mock, L=Mock, ST=Mock, C=US"
```

Then type the following on your terminal:

`yarn install:all`

`yarn start`

Then open a new instance on the project root and type:

`yarn android:emus`

to select an android emulator to run the app.

#

# Git Conventions

### Convential commits

This project uses conventional commits format.

Read more [here](./docs/conventional_commits.md)

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

to generate the i18n types run:

```bash
yarn i18n:types
```

to watch i18n changes and starting the metro bundler:

```bash
yarn start:i18n
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
