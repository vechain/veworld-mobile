/* eslint-disable no-console */

import {
    Before,
    BeforeAll,
    AfterAll,
    After,
    ITestCaseHookParameter,
} from "@cucumber/cucumber"
import detox from "detox/internals"
import { AdvancedSettingsFlow, HomeFlows, SettingsFlows } from "../helpers"

BeforeAll({ timeout: 600 * 1000 }, async () => {
    console.log("Starting a new Detox test session...")
    await detox.init()
    console.log("Detox test session started!")

    console.log("Launching app...")
    await device.launchApp({ newInstance: true })
    console.log("App launched!")
})

Before({ timeout: 600 * 1000 }, async (message: ITestCaseHookParameter) => {
    await device.terminateApp()

    const { pickle } = message
    console.log("Starting Detox test: " + pickle.name)
    await detox.onTestStart({
        title: pickle.uri,
        fullName: pickle.name,
        status: "running",
    })
})

After({ timeout: 600 * 1000 }, async (message: ITestCaseHookParameter) => {
    const { pickle, result } = message
    await detox.onTestDone({
        title: pickle.uri,
        fullName: pickle.name,
        status: result ? "passed" : "failed",
    })
    // reset app after each test
    await HomeFlows.goToSettings()
    await SettingsFlows.goToAdvancedSettings()
    await AdvancedSettingsFlow.resetApp()
})

AfterAll({ timeout: 600 * 1000 }, async () => {
    console.log("Starting cleanup Detox test session...")
    await detox.cleanup()
    console.log("Detox test session cleaned up!")
})
