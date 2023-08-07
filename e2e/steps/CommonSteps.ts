/* eslint-disable no-console */

import { Given, When } from "@cucumber/cucumber"
import {
    HomeFlows,
    HomeScreen,
    OnboardingFlows,
    SettingsFlows,
    TEST_PASSWORD,
    TabFlows,
    clickById,
    clickByText,
    goBack,
    idShouldExist,
} from "../helpers"
import { isPinRequested } from "../helpers/flows/HomeFlows"
import { insertPassword } from "../helpers/flows/OnboardingFlows"

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
    if (await isPinRequested()) {
        await insertPassword(TEST_PASSWORD)
    } else {
        if (!(await HomeScreen.isActive())) await clickByText("DEV:DEMO")
    }
})

Given("The user has more than one account", { timeout: -1 }, async function () {
    await clickById("AccountCard_accountManagementButton")
    await clickById("AccountManagementBottomSheet_addAccountButton")
    await clickByText("Wallet 1", { index: 1 })
    await clickByText("Add account")
})

Given("The user selects Account 1", { timeout: -1 }, async function () {
    await clickById("AccountCard_changeAccountButton")
    await clickByText("Account 1")
})

Given("The user selects Account 2", { timeout: -1 }, async function () {
    await clickById("AccountCard_changeAccountButton")
    await clickByText("Account 2")
})

Given("The user selects the test network", { timeout: -1 }, async function () {
    await HomeFlows.goToSettings()
    await SettingsFlows.goToNetworkSettings()
    await SettingsFlows.selectTestNetwork()
})

Given("The user selects the main network", { timeout: -1 }, async function () {
    await HomeFlows.goToSettings()
    await SettingsFlows.goToNetworkSettings()
    await SettingsFlows.selectMainNetwork()
})

Given("The user clicks back button", { timeout: -1 }, async function () {
    await goBack()
})

Given("The user is in home screen", { timeout: -1 }, async function () {
    await idShouldExist("veworld-homepage")
})

Given("The user goes to home tab", { timeout: -1 }, async function () {
    await TabFlows.goBackToHomeTab()
})

When(
    "The user inserts password {string}",
    { timeout: -1 },
    async function (password: string) {
        await insertPassword(password)
    },
)
