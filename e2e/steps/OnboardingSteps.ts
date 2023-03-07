import { Given, Then } from "@cucumber/cucumber"
import { waitFor } from "detox"

Given("The user follows the onboarding process", async () => {
    await element(by.text("GET STARTED")).tap()

    await waitFor(element(by.text("NEXT: SUSTAINABLE")))
        .toExist()
        .withTimeout(2_000)
    await element(by.text("NEXT: SUSTAINABLE")).tap()

    await waitFor(element(by.text("NEXT: SAFE AND FAST")))
        .toExist()
        .withTimeout(2_000)
    await element(by.text("NEXT: SAFE AND FAST")).tap()
})

Then("The user should be onboarded", async () => {
    await waitFor(element(by.text("NEXT: CREATE PASSWORD")))
        .toBeVisible()
        .withTimeout(2_000)
})
