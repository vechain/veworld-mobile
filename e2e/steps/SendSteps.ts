import { Given, Then, When } from "@cucumber/cucumber"
import {
    HomeFlows,
    clickByText,
    idShouldExist,
    insertTextById,
    textShouldExist,
} from "../helpers"

Given("The user is in the send screen", { timeout: -1 }, async function () {
    await HomeFlows.goToSend()
})

Given(
    "The user selects {string} token to be sent",
    { timeout: -1 },
    async function (token: string) {
        await clickByText(token)
    },
)

When(
    "The user inserts a very small amount to be sent",
    { timeout: -1 },
    async function () {
        await insertTextById("0.00001", "SendScreen_amountInput")
    },
)

When(
    "The user inserts the amount {string} to be sent",
    { timeout: -1 },
    async function (amount: string) {
        await insertTextById(amount, "SendScreen_amountInput")
    },
)

When(
    "The user inserts the address {string} of the receiver",
    { timeout: -1 },
    async function (address: string) {
        await insertTextById(address, "InsertAddressSendScreen_addressInput")
    },
)

Then(
    "The user can click next button to go to the next screen",
    { timeout: -1 },
    async function () {
        await clickByText("NEXT")
    },
)

When("The user can click confirm button", { timeout: -1 }, async function () {
    await clickByText("CONFIRM")
})

When(
    "The user inserts a comma on the amount to be sent",
    { timeout: -1 },
    async function () {
        await insertTextById("0,1", "SendScreen_amountInput")
    },
)

Then(
    "The user sees the amount with the comma converted to a dot",
    { timeout: -1 },
    async function () {
        await textShouldExist("0.1")
    },
)

Then(
    "The user should see successfully received message for the token {string}",
    { timeout: -1 },
    async function (token: string) {
        if (token === "VET") {
            await idShouldExist("informUserForIncomingVETSuccessToast", {
                timeout: 20000,
            })
        } else {
            await idShouldExist("informUserForIncomingTokenSuccessToast", {
                timeout: 20000,
            })
        }
    },
)

Then(
    "The user should see successfully sent message for the token {string}",
    { timeout: -1 },
    async function (token: string) {
        if (token === "VET") {
            await idShouldExist("InformUserForOutgoingVETSuccessToast", {
                timeout: 20000,
            })
        } else {
            await idShouldExist("informUserForOutgoingTokenSuccessToast", {
                timeout: 20000,
            })
        }
    },
)

Then(
    "The user should see NFT sent with success message",
    { timeout: -1 },
    async function () {
        await idShouldExist("informUserForOutgoingNFTSuccessToast", {
            timeout: 20000,
        })
    },
)

Then(
    "The user should see NFT incoming with success message",
    { timeout: -1 },
    async function () {
        await idShouldExist("informUserForIncomingNFTSuccessToast", {
            timeout: 20000,
        })
    },
)
