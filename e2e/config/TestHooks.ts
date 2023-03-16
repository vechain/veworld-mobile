import { AfterAll, Before, BeforeAll } from "@cucumber/cucumber"
import * as detoxConfig from "detox/internals"

//const DEFAULT_TIMEOUT = 300 * 1000

BeforeAll({ timeout: 300 * 1000 }, async () => {
    console.log("Starting a new Detox test session...")
    await detoxConfig.init()
    console.log("Detox test session started!")

    console.log("Launching app...")
    await detox.device.launchApp()
    console.log("App launched!")
})

Before({ timeout: 180 * 1000 }, async function (feature) {
    // Do not reload app for the "app-lifecycle" tagged tests
    // as reloading is part of the test itself and is handled manually
    if (feature.pickle.tags.some(tag => tag.name !== "@app-lifecycle")) {
        // On android, reloading RN bundle closes realms, causing the tests to crash
        if (detox.device.getPlatform() === "android") {
            await detox.device.launchApp({ newInstance: true })
        } else {
            await detox.device.reloadReactNative()
        }
    }
})

AfterAll({ timeout: 180 * 1000 }, async () => {
    await detoxConfig.cleanup()
})
