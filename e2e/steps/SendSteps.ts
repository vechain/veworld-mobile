import { Given } from "@cucumber/cucumber"
import { HomeFlows, clickByText, insertTextById } from "../helpers"

Given("The user is in the send screen", { timeout: -1 }, async function () {
    await HomeFlows.goToSend()
})

Given(
    "The user select {string} token to be sent",
    { timeout: -1 },
    async function (token: string) {
        await clickByText(token)
    },
)

Given(
    "The user insert a very small amount to be sent",
    { timeout: -1 },
    async function () {
        await insertTextById("0.00001", "SendScreen_amountInput")
    },
)

Given(
    "The user can click next button to go to the next screen",
    { timeout: -1 },
    async function () {
        await clickByText("NEXT")
    },
)
