/* eslint-disable no-console */

import { Given } from "@cucumber/cucumber"
import { HomeScreen, OnboardingFlows } from "../helpers"

Given("The app is opened", { timeout: -1 }, async () => {
    let retries: number = 5
    while (retries-- > 0) {
        try {
            console.log("HERE")
            await detox.device.launchApp({ newInstance: true })
            break
        } catch (error) {
            console.log("Error while launching app: " + error)
        }
    }
    if (retries === 0) return "skipped"
})

Given("The user has previously onboarded", { timeout: -1 }, async function () {
    if (!(await HomeScreen.isActive()))
        await OnboardingFlows.completeOnboarding()
})
