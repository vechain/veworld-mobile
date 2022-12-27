# Detox

This project objective is to test the implementation and usecases of e2e testing in React Native using [detox](https://wix.github.io/Detox/) and [cucumber](https://cucumber.io/).

# Project setup

## Detox Installation

### Global

1. [MacOS Only] `brew tap wix/brew` and `brew install applesimutils`
2. `yarn global add detox-cli`

### Local (Project)

3. `yarn add detox -dev`
4. `yarn add "jest@^29" --dev`

### init detox

On terminal run: `detox init`. This command will create a new `e2e` directory inside the project along with a `detoxrc.js` config file. On the detox configuration file do the following changes changes:

#

## Detox Configuration - iOS

Your app name with `YOUR_APP` wherever you see it in the scafold code.

```js
     apps: {
         'ios.debug': {
         type: 'ios.app',
         - binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/YOUR_APP.app',
         + binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/e2etests.app',

         .....
```

On the terminal run: `xcrun simctl list devicetypes` for a list of available devices.

```
== Device Types ==
iPhone 4s (com.apple.CoreSimulator.SimDeviceType.iPhone-4s)
iPhone 5 (com.apple.CoreSimulator.SimDeviceType.iPhone-5)
…
iPhone SE (2nd generation) (com.apple.CoreSimulator.SimDeviceType.iPhone-SE--2nd-generation-)
iPhone 12 mini (com.apple.CoreSimulator.SimDeviceType.iPhone-12-mini)
iPhone 12 (com.apple.CoreSimulator.SimDeviceType.iPhone-12)
iPhone 12 Pro (com.apple.CoreSimulator.SimDeviceType.iPhone-12-Pro)
…
```

and then change the desired device on the `detoxrc.js` file.

```js
    simulator: {
        type: 'ios.simulator',
        device: {
            - type: 'iPhone 12',
            + type: 'iPhone 14 Pro',
        },
    },
```

#

## Detox Configuration - Android

On the terminal run: `emulator -list-avds` for a list of available devices.

```
Pixel_6_Pro_API_31
Pixel_API_30
```

and then change the desired device on the `detoxrc.js` file.

```js
    emulator: {
        type: 'android.emulator',
        device: {
            - avdName: 'Pixel_3a_API_30_x86',
            + avdName: 'Pixel_6_Pro_API_31',
        },
    },
```

Next you need to do some changes/patching on some of the native android files:

- Build scripts:
  - `android/build.gradle`
  - `android/app/build.gradle`
- Native test code:
  - `android/app/src/androidTest/java/com/<your.package>/DetoxTest.java`
- Manifests:
  - `android/app/src/main/AndroidManifest.xml`
  - `android/app/src/main/res/xml/network_security_config.xml`

### Patching build scripts

file `android/build.gradle`

```js
buildscript {
    ext {
        buildToolsVersion = "31.0.0"
        + minSdkVersion = 21 // (1)
        compileSdkVersion = 30
        targetSdkVersion = 30
        + kotlinVersion = 'X.Y.Z' // (2)
    }
    .....
```

```js
    dependencies {
        classpath("de.undercouch:gradle-download-task:5.0.1")
        + classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion") // (3)
        .....
```

```js
allprojects {
    repositories {
        …
        google()
        + maven { // (4)
            + url("$rootDir/../node_modules/detox/Detox-android")
        + }
        maven { url 'https://www.jitpack.io' }
    }
    ....
```

1. Make sure your minSdkVersion is at least 18 or higher.
2. Define a global kotlinVersion constant. Replace `X.Y.Z` with the actual version number. To get one, open **Android Studio**, go to `Preferences > Languages & Frameworks > Kotlin` and look at `Current Kotlin plugin version field`. For example, `211-1.5.30-release-408-AS7442.40` means you have version `1.5.30`.

3. The line adds **Kotlin Gradle plugin** to the build script. If your project is not entirely new, there's a chance you might have it already, so make sure you aren't adding it twice. 😉.

4. Last, we add Detox as a precompiled native dependency, `.aar`.

file `android/app/build.gradle`

```js
 …
 android {
   …
   defaultConfig {
     …
     versionCode 1
     versionName "1.0"
+    testBuildType System.getProperty('testBuildType', 'debug')
+    testInstrumentationRunner 'androidx.test.runner.AndroidJUnitRunner'
   …
   buildTypes {
     release {
       minifyEnabled true
       proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
+      proguardFile "${rootProject.projectDir}/../node_modules/detox/android/detox/proguard-rules-app.pro"

       signingConfig signingConfigs.release
     }
   }
   …

 dependencies {
+  androidTestImplementation('com.wix:detox:+')
+  implementation 'androidx.appcompat:appcompat:1.1.0'
   implementation fileTree(dir: "libs", include: ["*.jar"])

```

### Adding an auxiliary Android test

Detox requires that your project has a single dummy native Android test with some special content, which will be picked up by testRunner that you just added in the previous step, so let's create it now.

Copy the snippet below to create a file under the following path (where `<your.package>` is your actual package name):

file `android/app/src/androidTest/java/com/<your.package>/DetoxTest.java`

```js
package com.<your.package>; // (1)

import com.wix.detox.Detox;
import com.wix.detox.config.DetoxConfig;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {
    @Rule // (2)
    public ActivityTestRule<MainActivity> mActivityRule = new ActivityTestRule<>(MainActivity.class, false, false);

    @Test
    public void runDetoxTests() {
        DetoxConfig detoxConfig = new DetoxConfig();
        detoxConfig.idlePolicyConfig.masterTimeoutSec = 90;
        detoxConfig.idlePolicyConfig.idleResourceTimeoutSec = 60;
        detoxConfig.rnContextLoadTimeoutSec = (BuildConfig.DEBUG ? 180 : 60);

        Detox.runTests(mActivityRule, detoxConfig);
    }
}
```

1. Replace with your package name. To look it up, you could copy and paste the first line from `android/app/src/main/java/com/<your.package>/MainActivity.java`.

2. Usually not the case, but you might have a custom activity name instead of a default MainActivity. To check whether it is so or not, open your `android/app/src/main/AndroidManifest.xml`, and check what your main activity is called:

### Enabling unencrypted traffic for Detox ([Doc](https://wix.github.io/Detox/docs/introduction/project-setup#43-enabling-unencrypted-traffic-for-detox))

Create a new network security config file for Android (or patch it if you have one):

file `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```

If you had no network security config before, it means you also have to register it after creation:

file `android/app/src/main/AndroidManifest.xml`

```xml
 <manifest>
   <application
   …
+    android:networkSecurityConfig="@xml/network_security_config">
   </application>
 </manifest>
```

# Build the app

In order to run new tests (on new app features) we first need to build the app.

### iOS

- `npx pod-install`
- `detox build --configuration ios.sim.debug`
- `detox build --configuration ios.sim.release`

### Android

- `detox build --configuration android.emu.debug`
- `detox build --configuration android.emu.release`

# Run tests

`yarn start`

### iOS

- `detox test --configuration ios.sim.debug`
- `detox test --configuration ios.sim.release`

### Android

- `detox test --configuration android.emu.debug`
- `detox test --configuration android.emu.release`
-

# Cucumber Installation - WIP

1. `yarn add @cucumber/cucumber --dev`
