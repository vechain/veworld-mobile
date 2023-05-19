import { waitFor, element } from "detox"
import { DEFAULT_TIMEOUT, LONG_TIMEOUT } from "../../constants"

export const isActive = async (): Promise<boolean> => {
    return await waitFor(element(by.text("Your Mnemonic")))
        .toBeVisible()
        .withTimeout(LONG_TIMEOUT)
        .then(() => true)
        .catch(() => false)
}

export const clickCreateWallet = async () => {
    await waitFor(element(by.text("Create new wallet")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("Create new wallet")).tap()
}

export const clickImportWallet = async () => {
    await waitFor(element(by.text("Import wallet")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("Import wallet")).tap()
}

export const isImportBottomSheetOpened = async () => {
    await waitFor(
        element(by.text("Which kind of wallet do you want to import?")),
    )
        .toExist()
        .withTimeout(LONG_TIMEOUT)
    await waitFor(element(by.text("Local wallet")))
        .toExist()
        .withTimeout(LONG_TIMEOUT)
    await waitFor(element(by.text("Hardware wallet")))
        .toExist()
        .withTimeout(LONG_TIMEOUT)
}

export const clickImportLocalWallet = async () => {
    await waitFor(element(by.text("Local wallet")))
        .toExist()
        .withTimeout(LONG_TIMEOUT)
    await element(by.text("Local wallet")).tap()
}

export const clickImportHardwareWallet = async () => {
    await waitFor(element(by.text("Hardware wallet")))
        .toExist()
        .withTimeout(LONG_TIMEOUT)
    await element(by.text("Hardware wallet")).tap()
}
