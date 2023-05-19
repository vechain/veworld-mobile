import { waitFor, element } from "detox"
import assert from "assert"
import { WalletSetupScreen, WelcomeScreen } from "../screens"
import {
    DEFAULT_TIMEOUT,
    SHORT_TIMEOUT,
    TEST_MNEMONIC,
    TEST_PASSWORD,
} from "../constants"

export const skipToCreateLocalWallet = async () => {
    await WelcomeScreen.goToWalletSetup()
    await WalletSetupScreen.clickCreateWallet()
}

export const skipToImportLocalWallet = async () => {
    await WelcomeScreen.goToWalletSetup()
    await WalletSetupScreen.clickImportWallet()
    await WalletSetupScreen.clickImportLocalWallet()
}

export const pasteMnemonic = async (mnemonic: string) => {
    await waitFor(element(by.id("import-mnemonic-input")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.id("import-mnemonic-input")).replaceText(mnemonic)

    // TextInput needs to be tapped again to be able to dismiss keyboard
    await element(by.id("import-mnemonic-input")).tap()

    // Dismiss keyboard by tapping outside, for example the title
    await element(by.text("Import Local Wallet")).tap()

    await waitFor(element(by.text("Verify")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.text("Verify")).tap()
}

export const chooseAndConfirmPassword = async (
    password: string,
    confirmPassword: string,
) => {
    for (let i = 0; i < password.length; i++) {
        await element(by.text(password.charAt(i))).tap()
    }

    for (let i = 0; i < confirmPassword.length; i++) {
        await element(by.text(confirmPassword.charAt(i))).tap()
    }
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

export const completeOnboarding = async (
    mnemonic?: string,
    password?: string,
) => {
    await skipToImportLocalWallet()

    mnemonic = mnemonic || TEST_MNEMONIC
    password = password || TEST_PASSWORD

    await pasteMnemonic(mnemonic)

    await element(by.text("Create password")).tap()

    await chooseAndConfirmPassword(password, password)

    await element(by.text("CREATE WALLET")).tap()
}
