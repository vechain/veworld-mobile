/** @type {Detox.DetoxConfig} */
module.exports = {
    testRunner: {
        args: {
            $0: "cucumber-js",
            // config: "e2e/config.js",
        },
    },
    apps: {
        "ios.debug": {
            type: "ios.app",
            binaryPath:
                "ios/build/Build/Products/Debug-iphonesimulator/VeWorld.app",
            build: "xcodebuild -workspace ios/VeWorld.xcworkspace -scheme VeWorld -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
        },
        "ios.release": {
            type: "ios.app",
            binaryPath:
                "ios/build/Build/Products/Release-iphonesimulator/VeWorld.app",
            build: "xcodebuild -workspace ios/VeWorld.xcworkspace -scheme VeWorld -configuration Release -sdk iphonesimulator -derivedDataPath ios/build",
        },
        "android.debug": {
            type: "android.apk",
            binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
            build: "cd android ; ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug ; cd -",
            reversePorts: [8081],
        },
        "android.release": {
            type: "android.apk",
            binaryPath: "android/app/build/outputs/apk/release/app-release.apk",
            build: "cd android ; ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release ; cd -",
        },
    },
    devices: {
        simulator: {
            type: "ios.simulator",
            device: {
                type: "iPhone 14 Pro",
            },
        },
        attached: {
            type: "android.attached",
            device: {
                adbName: ".*",
            },
        },
        emulator_31: {
            type: "android.emulator",
            device: {
                avdName: "Pixel_6_Pro_API_31",
            },
        },
        emulator_33: {
            type: "android.emulator",
            device: {
                avdName: "Pixel_6_Pro_API_33",
            },
        },
    },
    configurations: {
        "ios.sim.debug": {
            device: "simulator",
            app: "ios.debug",
        },
        "ios.sim.release": {
            device: "simulator",
            app: "ios.release",
        },
        "android.att.debug": {
            device: "attached",
            app: "android.debug",
        },
        "android.att.release": {
            device: "attached",
            app: "android.release",
        },
        "android.emu.debug.31": {
            device: "emulator_31",
            app: "android.debug",
        },
        "android.emu.release.31": {
            device: "emulator_31",
            app: "android.release",
        },
        "android.emu.debug.33": {
            device: "emulator_33",
            app: "android.debug",
        },
        "android.emu.release.33": {
            device: "emulator_33",
            app: "android.release",
        },
    },
}
