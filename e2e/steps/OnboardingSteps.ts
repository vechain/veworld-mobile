import { Given, Then, When } from "@cucumber/cucumber"
import { waitFor, element } from "detox"
import OnboardingFlows from "../helpers/flows/OnboardingFlows"

Given("The user follows the onboarding process", async () => {
    await OnboardingFlows.onboard()
})

When("The user skips to password creation", async () => {
    await element(by.text("GET STARTED")).tap()

    await element(by.text("Skip ahead to create password")).tap()
})

Given("The user follows the wallet creation process", async () => {
    await OnboardingFlows.onboard()

    await element(by.text("NEXT: CREATE PASSWORD")).tap()

    await OnboardingFlows.createWallet()
})

When("The user skips to recovery phase", async () => {
    await element(by.text("NEXT: CREATE PASSWORD")).tap()

    await element(by.text("Create new wallet")).tap()

    await element(by.text("Skip ahead to recovery phrase")).tap()
})

Then("The user should be onboarded", async () => {
    await waitFor(element(by.text("NEXT: CREATE PASSWORD")))
        .toBeVisible()
        .withTimeout(2_000)
})

Then("The user should see password creation", async () => {
    await waitFor(element(by.text("Create Wallet")))
        .toBeVisible()
        .withTimeout(2_000)
})

Then("The user can create wallet", async () => {
    await waitFor(element(by.text("Your Mnemonic")))
        .toBeVisible()
        .withTimeout(2_000)
})
