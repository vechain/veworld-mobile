import detox from "detox"
import { AfterAll, Before, BeforeAll } from "@cucumber/cucumber"
import * as detoxConfig from "detox/internals"

BeforeAll({ timeout: 120_000 }, async () => {
    await detoxConfig.init()
    await detox.device.launchApp()
})

Before({ timeout: 120_000 }, async () => {
    await detox.device.reloadReactNative()
})

AfterAll({ timeout: 120_000 }, async () => {
    await detoxConfig.cleanup()
})
