import { clickById, clickByText, insertTextById } from "../common"
import { LONG_TIMEOUT } from "../constants"
import { enterPin } from "./OnboardingFlows"

export const importObservedWalletFlow = async (walletAddress: string) => {
    await clickById("add-wallet-button")
    await clickById("import-observe-wallet-button")
    await insertTextById(walletAddress, "observe-wallet-address-input")
    await clickById("observe-wallet-confirm-button")
    await clickById("observe-wallet-account-card")
    await clickById("observe-wallet-confirm-operation")
}

export const deleteWallet = async () => {
    // get element that is with id DeviceBox and has descendant with text Observed
    await element(by.id("DeviceBox").withDescendant(by.text("Observed"))).swipe("left", "slow", 0.4)
    await element(by.id("DeleteUnderlay_DeleteIcon_observable")).tap()
    await clickByText("REMOVE WALLET", { timeout: LONG_TIMEOUT })
    await enterPin("111111")
}
