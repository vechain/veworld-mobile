/* eslint-disable no-console */
import { Given, Then, When } from "@cucumber/cucumber"
import { waitFor, element } from "detox"
import {
    AdvancedSettingsFlow,
    BiometricsScreen,
    ConfirmMnemonicScreen,
    HomeFlows,
    LONG_TIMEOUT,
    MnemonicScreen,
    OnboardingFlows,
    WalletSuccessScreen,
    WelcomeScreen,
} from "../helpers"

Given(
    "The app is opened and is iOS and has biometrics authorization",
    { timeout: -1 },
    async () => {
        if (detox.device.getPlatform() !== "ios") return "skipped"

        let retries: number = 5
        while (retries-- > 0) {
            try {
                await detox.device.launchApp({
                    newInstance: true,
                    permissions: { faceid: "YES" },
                })
                break
            } catch (error) {
                console.log("Error while launching app: " + error)
            }
        }
        if (retries === 0) return "skipped"
    },
)

Given(
    "The app is opened and is iOS and does not have biometrics authorization",
    { timeout: -1 },
    async () => {
        if (detox.device.getPlatform() !== "ios") return "skipped"

        let retries: number = 5
        while (retries-- > 0) {
            try {
                await detox.device.launchApp({
                    newInstance: true,
                    permissions: { faceid: "NO" },
                })
                break
            } catch (error) {
                console.log("Error while launching app: " + error)
            }
        }
        if (retries === 0) return "skipped"
    },
)

Given("The app is opened and is iOS", { timeout: -1 }, async () => {
    if (detox.device.getPlatform() !== "ios") return "skipped"

    let retries: number = 5
    while (retries-- > 0) {
        try {
            await detox.device.launchApp({
                newInstance: true,
            })
            break
        } catch (error) {
            console.log("Error while launching app: " + error)
        }
    }
    if (retries === 0) return "skipped"
})

Given(
    "The user is in the onboarding welcome screen",
    { timeout: -1 },
    async () => {
        if (!(await WelcomeScreen.isActive())) {
            await HomeFlows.goToAdvancedSettings()
            await AdvancedSettingsFlow.resetApp()
        }
    },
)

When("The user generates a new wallet", { timeout: -1 }, async () => {
    await OnboardingFlows.skipToCreateLocalWallet()
})

When("The user skips to creating a new local wallet", async () => {
    await OnboardingFlows.skipToCreateLocalWallet()
})

When("The user skips to import local wallet", async () => {
    await OnboardingFlows.skipToImportLocalWallet()
})

When("The user onboards with a new local wallet", { timeout: -1 }, async () => {
    await OnboardingFlows.skipToCreateLocalWallet()

    const mnemonic = await MnemonicScreen.backupMnemonicAndContinue()

    await ConfirmMnemonicScreen.verifyMnemonic(mnemonic)
})

When(
    "The user onboards with an imported mnemonic {string}",
    { timeout: -1 },
    async (mnemonic: string) => {
        await OnboardingFlows.skipToImportLocalWallet()
        await OnboardingFlows.pasteMnemonic(mnemonic)
    },
)

When(
    "The user chooses to protect the wallet with a password {string} and confirms with {string}",
    { timeout: -1 },
    async (password: string, confirmPassword: string) => {
        await element(by.text("Create password")).tap()
        await OnboardingFlows.chooseAndConfirmPassword(
            password,
            confirmPassword,
        )
    },
)

When(
    "The user chooses to protect the wallet with biometrics",
    { timeout: -1 },
    async () => {
        await BiometricsScreen.enrollBiometrics(true)
        await OnboardingFlows.protectWithBiometrics()
    },
)

When(
    "The user chooses to protect the wallet with biometrics and does not enroll",
    { timeout: -1 },
    async () => {
        await BiometricsScreen.enrollBiometrics(false)
        await OnboardingFlows.protectWithBiometrics()
    },
)

Then("The user should see wallet success screen", async () => {
    await WalletSuccessScreen.isActive()
})

Then(
    "The user should not see wallet success screen",
    { timeout: -1 },
    async () => {
        await waitFor(element(by.text("You're finally one of us!")))
            .not.toBeVisible()
            .withTimeout(LONG_TIMEOUT)
    },
)

Then(
    "The user should not see wallet protection screen",
    { timeout: -1 },
    async () => {
        await waitFor(element(by.text("Protect your wallet")))
            .not.toBeVisible()
            .withTimeout(LONG_TIMEOUT)
    },
)

Then(
    "The user should see biometrics disabled alert",
    { timeout: -1 },
    async () => {
        await waitFor(element(by.text("Biometrics previously denied")))
            .toBeVisible()
            .withTimeout(LONG_TIMEOUT)
    },
)

Then(
    "The user should see biometrics not enrolled alert",
    { timeout: -1 },
    async () => {
        await waitFor(element(by.text("Biometrics not available")))
            .toBeVisible()
            .withTimeout(LONG_TIMEOUT)
    },
)
