import { Given, Then } from "@cucumber/cucumber"
import detox from "detox"

Given("The user opens the app", function () {
    //TODO: Not implemented
})

Then("The user should see the welcome screen", async function () {
    await detox.element(by.text("GET STARTED")).tap()
})
