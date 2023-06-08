/* eslint-disable no-console */

import { Given } from "@cucumber/cucumber"
import {
    HomeFlows,
    HomeScreen,
    OnboardingFlows,
    SettingsFlows,
    TabFlows,
    clickById,
    clickByText,
    goBack,
    idShouldExist,
} from "../helpers"

Given("The app is opened", { timeout: -1 }, async () => {
    let retries: number = 5
    while (retries-- > 0) {
        try {
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

Given("Open with demo account", { timeout: -1 }, async function () {
    if (!(await HomeScreen.isActive())) await clickByText("DEV:DEMO")
})

Given("The user has more than one account", { timeout: -1 }, async function () {
    await clickById("AccountCard_accountManagementButton")
    await clickById("AccountManagementBottomSheet_addAccountButton")
    await clickByText("Wallet 1")
    await clickByText("Add account")
})

Given("The user select the test network", { timeout: -1 }, async function () {
    await HomeFlows.goToSettings()
    await SettingsFlows.goToNetworkSettings()
    await SettingsFlows.selectTestNetwork()
})

Given("The user select the main network", { timeout: -1 }, async function () {
    await HomeFlows.goToSettings()
    await SettingsFlows.goToNetworkSettings()
    await SettingsFlows.selectMainNetwork()
})

Given("The user click back button", { timeout: -1 }, async function () {
    await goBack()
})

Given("The user is in home screen", { timeout: -1 }, async function () {
    await idShouldExist("veworld-homepage")
})

Given("The user go to home tab", { timeout: -1 }, async function () {
    await TabFlows.goBackToHomeTab()
})
