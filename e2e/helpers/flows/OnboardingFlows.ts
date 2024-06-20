import { waitFor, element } from "detox"
import assert from "assert"
import { DEFAULT_TIMEOUT, SHORT_TIMEOUT } from "../constants"
import { clickByText } from "../common"

export const pasteIntoImportTextbox = async (text: string) => {
    await waitFor(element(by.id("import-input")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.id("import-input")).replaceText(text)

    // TextInput needs to be tapped again to be able to dismiss keyboard
    await element(by.id("import-input")).tap()

    // Dismiss keyboard by tapping outside, for example the title
    await element(by.text("Import Local Wallet")).tap()

    await waitFor(element(by.text("Verify")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.text("Verify")).tap()
}

export const enterPasswordAndUnlock = async (password: string) => {
    await element(by.id("unlock-keystore-password-input")).replaceText(password)
    await clickByText("UNLOCK")
}

export const enterPin = async (pin: string) => {
    for (let i = 0; i < pin.length; i++) {
        await element(by.text(pin.charAt(i))).tap()
    }
}

export const chooseAndConfirmPassword = async (pin: string, confirmPin: string) => {
    await enterPin(pin)
    await enterPin(confirmPin)
}

export const protectWithBiometrics = async () => {
    assert(detox.device.getPlatform() === "ios", "Not on iOS device")

    await waitFor(element(by.text("Use Biometrics")))
        .toBeVisible()
        .withTimeout(SHORT_TIMEOUT)
        .then(async () => {
            await element(by.text("Use Biometrics")).tap()
            await matchBiometrics()
            return
        })
        .catch(() => {})

    await waitFor(element(by.text("Use Face ID")))
        .toBeVisible()
        .withTimeout(SHORT_TIMEOUT)
        .then(async () => {
            await element(by.text("Use Face ID")).tap()
            await matchBiometrics()
            return
        })
        .catch(() => {})

    await waitFor(element(by.text("Use Fingerprint")))
        .toBeVisible()
        .withTimeout(SHORT_TIMEOUT)
        .then(async () => {
            await element(by.text("Use Fingerprint")).tap()
            await matchBiometrics()
            return
        })
        .catch(() => {})

    await waitFor(element(by.text("Use Touch ID")))
        .toBeVisible()
        .withTimeout(SHORT_TIMEOUT)
        .then(async () => {
            await element(by.text("Use Touch ID")).tap()
            await matchBiometrics()
            return
        })
        .catch(() => {})
}

export const matchBiometrics = async () => {
    if (element(by.text("Use Face ID"))) await detox.device.matchFace()
    if (element(by.text("Use Touch ID"))) await detox.device.matchFinger()
}
