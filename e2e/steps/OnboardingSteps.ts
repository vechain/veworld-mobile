import { Given, Then, When } from "@cucumber/cucumber"
import { waitFor, element } from "detox"
import OnboardingFlows from "../helpers/flows/OnboardingFlows"

Given("The user follows the onboarding process", { timeout: -1 }, async () => {
    await OnboardingFlows.onboard()
})

When("The user skips to password creation", { timeout: -1 }, async () => {
    await waitFor(element(by.text("GET STARTED")))
        .toBeVisible()
        .withTimeout(10_000)
    await element(by.text("GET STARTED")).tap()

    await waitFor(element(by.text("Skip ahead to create password")))
        .toBeVisible()
        .withTimeout(10_000)
    await element(by.text("Skip ahead to create password")).tap()
})

Given(
    "The user follows the wallet creation process",
    { timeout: -1 },
    async () => {
        await OnboardingFlows.onboard()

        await waitFor(element(by.text("NEXT: CREATE PASSWORD")))
            .toBeVisible()
            .withTimeout(10_000)
        await element(by.text("NEXT: CREATE PASSWORD")).tap()

        await OnboardingFlows.createWallet()
    },
)

When("The user skips to recovery phase", { timeout: -1 }, async () => {
    await waitFor(element(by.text("NEXT: CREATE PASSWORD")))
        .toBeVisible()
        .withTimeout(10_000)
    await element(by.text("NEXT: CREATE PASSWORD")).tap()

    await waitFor(element(by.text("Create new wallet")))
        .toBeVisible()
        .withTimeout(10_000)
    await element(by.text("Create new wallet")).tap()

    await waitFor(element(by.text("Skip ahead to recovery phrase")))
        .toBeVisible()
        .withTimeout(10_000)
    await element(by.text("Skip ahead to recovery phrase")).tap()
})

Then("The user should be onboarded", { timeout: -1 }, async () => {
    await waitFor(element(by.text("NEXT: CREATE PASSWORD")))
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
