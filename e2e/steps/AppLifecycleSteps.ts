import { Given, Then } from "@cucumber/cucumber"
import detox from "detox"
import { LONG_TIMEOUT } from "../helpers"

// Default cucumber timeout has to be deactivated for this step
Given("The user has installed the app", { timeout: -1 }, async () => {
    await detox.device.launchApp({ delete: true })
})

// Default cucumber timeout has to be deactivated for this step
Given("The user opens the app", { timeout: -1 }, async () => {
    // Terminates and launches a new instance of the app
    await detox.device.launchApp({ newInstance: true })
})

Given("The user brings the app from background", { timeout: -1 }, async () => {
    // Brings the app from the background
    await detox.device.launchApp({ newInstance: false })
})

Given("The user closes the app", { timeout: -1 }, async () => {
    await detox.device.terminateApp()
})

Then("The app is started successfully", { timeout: -1 }, async () => {
    await waitFor(element(by.id("welcome-title-id")))
        .toBeVisible()
        .withTimeout(LONG_TIMEOUT)
})
