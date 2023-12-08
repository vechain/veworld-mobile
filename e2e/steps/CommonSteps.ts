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
    goBack,
    idShouldExist,
    launchApp,
} from "../helpers"
import { isPinRequested } from "../helpers/flows/HomeFlows"
import { enterPin } from "../helpers/flows/OnboardingFlows"

Given("The app is opened", { timeout: -1 }, async () => {
    await launchApp()
})

Given("The user has previously onboarded", { timeout: -1 }, async function () {
    if (!(await HomeScreen.isActive())) await OnboardingFlows.completeOnboarding()
})

Given("Open with demo account", { timeout: -1 }, async function () {
    if (await isPinRequested()) {
        await enterPin(TEST_PIN)
    } else {
        if (!(await HomeScreen.isActive())) await clickByText("DEV:DEMO")
    }
    this.pin = TEST_PIN // save pin for later use
})

Given("The user has more than one account", { timeout: -1 }, async function () {
    await clickById("HomeScreen_WalletManagementButton")
    await clickByText("Wallet 1")
    await clickById("WalletDetailScreen_addAccountButton")
    await goBack()
    await goBack()
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

When("The user inserts pin {string}", { timeout: -1 }, async function (pin: string) {
    await enterPin(pin)
})

When("The user closes the {string} bottom sheet", { timeout: -1 }, async (name: string) => {
    await closeBottomSheet(name)
})
