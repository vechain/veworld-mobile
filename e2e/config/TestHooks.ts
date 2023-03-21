import { AfterAll, Before, BeforeAll } from "@cucumber/cucumber"
import * as detoxConfig from "detox/internals"

BeforeAll({ timeout: 600 * 1000 }, async () => {
    console.log("Starting a new Detox test session...")
    await detoxConfig.init()
    console.log("Detox test session started!")

    if (detox.device.getPlatform() === "ios") {
        console.log("Launching app...")
        await detox.device.launchApp()
        console.log("App launched!")
    }
})

Before({ timeout: 300 * 1000 }, async () => {
    if (detox.device.getPlatform() === "ios") {
        console.log("Relaunching app before test...")
        await detox.device.reloadReactNative()
        console.log("App relaunched!")
    }
})

AfterAll({ timeout: 600 * 1000 }, async () => {
    console.log("Starting cleanup Detox test session...")
    await detoxConfig.cleanup()
    console.log("Detox test session cleaned up!")
})
