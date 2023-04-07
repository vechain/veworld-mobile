import { Given, Then, When } from "@cucumber/cucumber"
import { waitFor, element } from "detox"
import OnboardingFlows from "../helpers/flows/OnboardingFlows"
import { WalletSuccessScreen } from "../helpers"

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

Given("The user follows the onboarding process", { timeout: -1 }, async () => {
    await OnboardingFlows.goThroughOnboardingSlides()
})

When("The user skips to password creation", { timeout: -1 }, async () => {
    await OnboardingFlows.skipToCreatePassword()
})

When(
    "The user follows the create wallet process",
    { timeout: -1 },
    async () => {
        await OnboardingFlows.goThroughPasswordSlides()
    },
)

When("The user selects to create a new wallet", { timeout: -1 }, async () => {
    await OnboardingFlows.selectCreateWallet()
})

When(
    "The user skips to creating a new local wallet",
    { timeout: -1 },
    async () => {
        await OnboardingFlows.skipToCreateLocalWallet()
    },
)

When("The user skips to import local wallet", { timeout: -1 }, async () => {
    await OnboardingFlows.skipToImportLocalWallet()
})

When("The user onboards with a new local wallet", { timeout: -1 }, async () => {
    const mnemonic = await OnboardingFlows.backupMnemonic()

    await OnboardingFlows.verifyMnemonic(mnemonic)
})

When(
    "The user imports a local wallet with the mnemonic {string}",
    { timeout: -1 },
    async (mnemonic: string) => {
        await OnboardingFlows.pasteMnemonic(mnemonic)
    },
)

When(
    "The user chooses to protect the wallet with a password",
    { timeout: -1 },
    async () => {
        await element(by.text("Create password")).tap()
    },
)

When(
    "The user enters a new password {string} and confirm password {string}",
    { timeout: -1 },
    async (password: string, confirmPassword: string) => {
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
        await OnboardingFlows.protectWithBiometrics()
    },
)

Then("The user should be onboarded", { timeout: -1 }, async () => {
    await waitFor(element(by.text("Create Wallet")))
        .toBeVisible()
        .withTimeout(10_000)
})

Then("The user should see password creation", { timeout: -1 }, async () => {
    await waitFor(element(by.text("Create Wallet")))
        .toBeVisible()
        .withTimeout(10_000)
})

Then("The user can create wallet", { timeout: -1 }, async () => {
    await waitFor(element(by.text("Your Mnemonic")))
        .toBeVisible()
        .withTimeout(10_000)
})

Then("The user should see wallet success screen", { timeout: -1 }, async () => {
    await WalletSuccessScreen.isActive()
})

Then(
    "The user should not see wallet success screen",
    { timeout: -1 },
    async () => {
        await waitFor(element(by.text("You're finally one of us!")))
            .not.toBeVisible()
            .withTimeout(10_000)
    },
)

Then(
    "The user should not see wallet protection screen",
    { timeout: -1 },
    async () => {
        await waitFor(element(by.text("Protect your wallet")))
            .not.toBeVisible()
            .withTimeout(10_000)
    },
)
