import { Given } from "@cucumber/cucumber"
import { HomeFlows } from "../../helpers"

Given("The user is in settings screen", { timeout: -1 }, async () => {
    await HomeFlows.goToSettings()
})
