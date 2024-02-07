import { Given, Then, When } from "@cucumber/cucumber"
import { HomeFlows, insertTextById, clickById, textShouldNotExist } from "../helpers"
import { deleteWallet, importObservedWalletFlow } from "../helpers/flows/importObservedWalletFlow"

Given("The user is in the wallet management screen", { timeout: -1 }, async () => {
    await HomeFlows.goToWalletManagement()
})

When("the user clicks on the Add Wallet button", { timeout: -1 }, async () => {
    await clickById("add-wallet-button")
})

When(
    "follows the procedure to add an observed wallet with the {string} address",
    { timeout: -1 },
    async (walletAddress: string) => {
        await clickById("import-observe-wallet-button")
        await insertTextById(walletAddress, "observe-wallet-address-input")
        await clickById("observe-wallet-confirm-button")
        await clickById("observe-wallet-account-card")
        await clickById("observe-wallet-confirm-operation")
    },
)

Then("he should see the observed wallet in the wallet list", { timeout: -1 }, async () => {
    waitFor(element(by.text("Observed"))).toBeVisible()
})

Given("the user has an observed wallet with address {string}", { timeout: -1 }, async (walletAddress: string) => {
    await importObservedWalletFlow(walletAddress)
})

When("the user deletes the wallet", { timeout: -1 }, async () => {
    await deleteWallet()
    await textShouldNotExist("Observed")
})

Then("he should see the wallet removed from the wallet list", { timeout: -1 }, async () => {
    await textShouldNotExist("Observed")
})
