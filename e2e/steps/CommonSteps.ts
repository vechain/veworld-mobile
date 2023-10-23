/* eslint-disable no-console */

import { Given, When } from "@cucumber/cucumber"
import {
    HomeFlows,
    HomeScreen,
    OnboardingFlows,
    SettingsFlows,
    TEST_PIN,
    TabFlows,
    clickById,
    clickByText,
    closeBottomSheet,
    closeToast,
    goBack,
    idShouldExist,
} from "../helpers"
import { isPinRequested } from "../helpers/flows/HomeFlows"
import { enterPin } from "../helpers/flows/OnboardingFlows"

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
        await enterPin(TEST_PIN)
    } else {
        if (!(await HomeScreen.isActive())) await clickByText("DEV:DEMO")
    }
})

Given("The user has more than one account", { timeout: -1 }, async function () {
    await clickById("HomeScreen_WalletManagementButton")
    await clickByText("Wallet 1")
    await clickById("WalletDetailScreen_addAccountButton")
})

Given("The user selects Account 1", { timeout: -1 }, async function () {
    await clickById("AccountDetailBox_Account 1")

    await goBack()
    await goBack()
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

Given("The user closes the toast message", { timeout: -1 }, async function () {
    await closeToast()
})

When(
    "The user inserts pin {string}",
    { timeout: -1 },
    async function (pin: string) {
        await enterPin(pin)
    },
)

When(
    "The user closes the {string} bottom sheet",
    { timeout: -1 },
    async (name: string) => {
        await closeBottomSheet(name)
    },
)
