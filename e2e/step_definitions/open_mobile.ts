import { Given, Then } from "@cucumber/cucumber"
import { waitFor } from "detox"

Given("The user opens the app", function () {
    //TODO: Not implemented
})

Then("The user should see the welcome screen", async function () {
    await element(by.id("GET_STARTED_BTN")).tap()
    await waitFor(element(by.id("ONBOARDING_SCREEN")))
        .toExist()
        .withTimeout(2000)
})
