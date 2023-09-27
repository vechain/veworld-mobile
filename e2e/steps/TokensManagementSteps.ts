import { Given, Then, When } from "@cucumber/cucumber"
import {
    HomeFlows,
    clickByText,
    goBack,
    textShouldExist,
    scrollUntilTextVisible,
    textShouldNotExist,
    insertTextById,
    clickById,
    swipeLeftByText,
} from "../helpers"

Given("The user go to tokens management screen", { timeout: -1 }, async () => {
    await HomeFlows.goToTokensManagementScreen()
})

When(
    "The user selects {string} token from the unselected tokens list",
    { timeout: -1 },
    async (token: string) => {
        await clickByText(token)
    },
)

Then(
    "The user should see {string} token balance in home screen",
    { timeout: -1 },
    async (token: string) => {
        await goBack()
        await textShouldExist(token)
    },
)

When(
    "The user selects {string} and {string} tokens from the unselected tokens list",
    { timeout: -1 },
    async (token: string, token2: string) => {
        await clickByText(token)
        await scrollUntilTextVisible(token2, "Layout_ScrollView")
        await clickByText(token2)
    },
)

Then(
    "The user should see {string} and {string} token balances in home screen",
    { timeout: -1 },
    async (token: string, token2: string) => {
        await goBack()
        await textShouldExist(token)
        await textShouldExist(token2)
    },
)

When("The user unselect {string}", { timeout: -1 }, async (token: string) => {
    await clickByText(token)
})

Then(
    "The user should not see {string} token balance in home screen",
    { timeout: -1 },
    async (token: string) => {
        await goBack()
        await textShouldNotExist(token)
    },
)

When(
    "The user type the query {string}",
    { timeout: -1 },
    async (query: string) => {
        await insertTextById(
            query,
            "ManageTokenScreen_SearchInput_searchTokenInput",
        )
    },
)

Then(
    "The list should display {string} and not {string}",
    { timeout: -1 },
    async (token: string, token2: string) => {
        await textShouldExist(token)
        await textShouldNotExist(token2)
    },
)

When(
    "The user add a custom token with address {string}",
    { timeout: -1 },
    async (address: string) => {
        await clickById("ManageTokenScreen_AddCustomToken_Button")
        await insertTextById(
            address,
            "AddCustomTokenBottomSheet-TextInput-Address",
        )
        await clickByText("Add")
    },
)

Then(
    "The user should see {string} custom token balance in home screen",
    { timeout: -1 },
    async (token: string) => {
        await textShouldExist(token)
    },
)

When(
    "The user add multiple custom tokens with address {string} and {string}",
    { timeout: -1 },
    async (address1: string, address2: string) => {
        await clickById("ManageTokenScreen_AddCustomToken_Button")
        await insertTextById(
            address1,
            "AddCustomTokenBottomSheet-TextInput-Address",
        )
        await clickByText("Add")
        await clickById("ManageTokenScreen_AddCustomToken_Button")
        await insertTextById(
            address2,
            "AddCustomTokenBottomSheet-TextInput-Address",
        )
        await clickByText("Add")
        await goBack()
    },
)

Then(
    "The user should see {string} and {string} balances in home screen",
    { timeout: -1 },
    async (token1: string, token2: string) => {
        await textShouldExist(token1)
        await textShouldExist(token2)
    },
)

When(
    "The user delete custom token {string}",
    { timeout: -1 },
    async (token1: string) => {
        await scrollUntilTextVisible(token1, "HomeScreen_ScrollView")
        await swipeLeftByText(token1)
        await clickById("DeleteUnderlay_DeleteIcon")
        await clickByText("REMOVE")
    },
)

Then(
    "The user should see {string} but not {string} in home screen",
    { timeout: -1 },
    async (token1: string, token2: string) => {
        await textShouldNotExist(token1)
        await textShouldExist(token2)
    },
)
