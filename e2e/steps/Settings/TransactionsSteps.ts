import { Given, Then, When } from "@cucumber/cucumber"
import {
    clickByText,
    textShouldExist,
    SettingsFlows,
    insertTextById,
    clickById,
    swipeByText,
    textShouldNotExist,
    isPresentText,
} from "../../helpers"

Given(
    "The user is in transactions settings screen",
    { timeout: -1 },
    async () => {
        await SettingsFlows.goToTransactionsSettings()
    },
)

When(
    "The user selects Account as delegation method",
    { timeout: -1 },
    async () => {
        await clickByText("Account")
    },
)

When(
    "The user selects the account {string} from the list",
    { timeout: -1 },
    async (account: string) => {
        await clickByText(account)
    },
)

Then(
    "The user should see the delegation account {string} card",
    { timeout: -1 },
    async (account: string) => {
        await textShouldExist(account)
    },
)

When("The user selects URL as delegation method", { timeout: -1 }, async () => {
    await clickByText("URL")
})

When(
    "The user inserts the following delegation url {string}",
    { timeout: -1 },
    async (url: string) => {
        await insertTextById(url, "AddUrl_input")

        await clickByText("Add")
    },
)

Then(
    "The user should see the delegation url {string} card",
    { timeout: -1 },
    async (url: string) => {
        await textShouldExist(url)
    },
)

Then(
    "The user can click the {string} url card to select it",
    { timeout: -1 },
    async (url: string) => {
        await clickByText(url)
    },
)

When(
    "The user click plus button to add a new url",
    { timeout: -1 },
    async () => {
        if (!(await isPresentText("Select URL"))) {
            await clickByText("URL")
        }
        await clickById("UrlList_addUrlButton")
    },
)

When("The user click Manage URLs button", { timeout: -1 }, async () => {
    await clickByText("Manage URLs")
})

When(
    "The user click the plus icon to add a new delegation url",
    { timeout: -1 },
    async () => {
        await clickById("ManageUrls_addUrlButton")
    },
)

When(
    "The user delete the delegation url {string}",
    { timeout: -1 },
    async (url: string) => {
        await swipeByText(url, "left")
        await clickById("DeleteUnderlay_DeleteIcon", { index: 0 })
    },
)

When(
    "The user should not see the delegation url {string} card",
    { timeout: -1 },
    async (url: string) => {
        await textShouldNotExist(url)
    },
)
