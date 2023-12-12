/* eslint-disable no-console */

import { Before, BeforeAll, AfterAll, After, ITestCaseHookParameter } from "@cucumber/cucumber"
import detox from "detox/internals"
import { launchApp, resetApp } from "../helpers"
import { PickleTagFilter } from "@cucumber/cucumber/lib/pickle_filter"

/**
 * Before all scenarios
 * - initialize the Detox test session
 */
BeforeAll({ timeout: 600 * 1000 }, async () => {
    console.log("Starting a new Detox test session...")
    await detox.init()
    console.log("Detox test session started!")
})

/**
 * Before each scenario
 * - launch the app
 */
Before({ timeout: 600 * 1000 }, async (message: ITestCaseHookParameter) => {
    const { pickle } = message
    console.log("Starting Detox test: " + pickle.name)
    await detox.onTestStart({
        title: pickle.uri,
        fullName: pickle.name,
        status: "running",
    })
    await launchApp()
})

/**
 * After each scenario
 * - reset the app to the initial state - can be skipped with @noReset tag
 * - terminate the app
 */
After({ timeout: 600 * 1000 }, async function (message: ITestCaseHookParameter) {
    const { pickle, result } = message
    const status = result?.status === "PASSED" ? "passed" : "failed"
    try {
        const noResetTags = new PickleTagFilter("@noReset")
        if (!noResetTags.matchesAllTagExpressions(pickle)) {
            await resetApp(this.pin)
        }
    } finally {
        await detox.onTestDone({
            title: pickle.uri,
            fullName: pickle.name,
            status,
        })
        await device.terminateApp()
    }
})

/**
 * After all scenarios
 * - cleanup the Detox test session
 */
AfterAll({ timeout: 600 * 1000 }, async () => {
    console.log("Starting cleanup Detox test session...")
    await detox.cleanup()
    console.log("Detox test session cleaned up!")
})
