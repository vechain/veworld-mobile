/* eslint-disable no-console */

import { GeneralSettingsFlow, HomeFlows, SettingsFlows } from "../flows"
import { isPinRequested } from "../flows/HomeFlows"
import { enterPin } from "../flows/OnboardingFlows"
import { HomeScreen } from "../screens"
import { clickByText, isPresentId, isPresentText } from "./ElementUtils"

// default launch args
const defaultArgs = {
    newInstance: true,
    launchArgs: {
        DTXEnableVerboseSyncSystem: "YES",
        DTXEnableVerboseSyncResources: "YES",
        detoxPrintBusyIdleResources: "YES",
        detoxURLBlacklistRegex: [".*vechain.*", ".*walletconnect.*", ".*coingecko.*"],
        appUrl: "http://localhost:8081",
    },
}

// launch args with faceid permission
const bioAuthArgs = {
    newInstance: true,
    permissions: { faceid: "YES" },
    launchArgs: {
        DTXEnableVerboseSyncSystem: "YES",
        DTXEnableVerboseSyncResources: "YES",
        detoxPrintBusyIdleResources: "YES",
        detoxURLBlacklistRegex: [".*vechain.*", ".*walletconnect.*", ".*coingecko.*"],
        appUrl: "http://localhost:8081",
    },
}

// launch args without faceid permission
const bioUnAuthArgs = {
    newInstance: true,
    permissions: { faceid: "NO" },
    launchArgs: {
        DTXEnableVerboseSyncSystem: "YES",
        DTXEnableVerboseSyncResources: "YES",
        detoxPrintBusyIdleResources: "YES",
        detoxURLBlacklistRegex: [".*vechain.*", ".*walletconnect.*", ".*coingecko.*"],
        appUrl: "http://localhost:8081",
    },
}

// attempt to launch app
export const launchApp = async (args = defaultArgs) => {
    let retries: number = 5
    while (retries-- > 0) {
        try {
            await detox.device.launchApp(args)
            break
        } catch (error) {
            console.log("Error while launching app: " + error)
            throw error
        }
    }
    if (retries === 0) throw new Error("Could not launch app after 5 attempts")
}

export const launchAppWithBioAuth = async () => {
    if (detox.device.getPlatform() !== "ios") throw new Error("Can't enable Biometrics for Android")
    await detox.device.setBiometricEnrollment(true)
    await launchApp(bioAuthArgs)
}

export const launchAppWithBioUnAuth = async () => {
    await launchApp(bioUnAuthArgs)
}

/**
 * Reset the app to the initial state
 * If can't reset, terminate and launch the app
 * Enter pin if required
 * Reset the app from settings
 *
 * @param pin Pin to enter if required
 */
export const resetApp = async function (pin?: string) {
    try {
        // if cant navigate to settings, terminate and launch app
        if (!(await isPresentId("settings-tab"))) {
            await detox.device.terminateApp()
            await launchApp()
        }
        // if pin is required, enter pin
        if (await isPinRequested()) {
            if (!pin) throw new Error("Pin required but not provided")
            await enterPin(pin)
        }
        // if not in home screen, try use demo account
        if (!(await HomeScreen.isActive())) {
            if (await isPresentText("DEV:DEMO")) {
                await clickByText("DEV:DEMO")
            }
        }
        // check again if can navigate to settings, if not, throw error
        if (await isPresentId("settings-tab")) {
            await HomeFlows.goToSettings()
            await SettingsFlows.goToGeneralSettings()
            await GeneralSettingsFlow.resetApp()
        } else {
            console.log("Cannot reset app")
            throw new Error("Settings tab not visible")
        }
    } catch (error) {
        await device.takeScreenshot("resetApp")
        throw error
    }
}
