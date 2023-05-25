import { Given, Then, When } from "@cucumber/cucumber"
import {
    ManageTokenScreen,
    HomeFlows,
    clickByText,
    goBack,
    textShouldExist,
} from "../helpers"

Given(
    "The user is in the tokens management screen",
    { timeout: -1 },
    async () => {
        if (!(await ManageTokenScreen.isActive())) {
            await HomeFlows.goToTokensManagementScreen()
        }
    },
)

When(
    "The user select plair token from the unselected tokens list",
    { timeout: -1 },
    async () => {
        await clickByText("Plair")
    },
)

Then(
    "The user should see plair token balance in home screen",
    { timeout: -1 },
    async () => {
        await goBack()
        await textShouldExist("Plair")
    },
)
