import { waitFor, element } from "detox"
import assert from "assert"
import { MnemonicScreen } from "../screens"
import { DEFAULT_TIMEOUT, SHORT_TIMEOUT } from "../constants"

const goThroughOnboardingSlides = async () => {
    await waitFor(element(by.text("GET STARTED")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("GET STARTED")).tap()

    await waitFor(element(by.text("NEXT: SUSTAINABLE")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("NEXT: SUSTAINABLE")).tap()

    await waitFor(element(by.text("NEXT: SAFE AND FAST")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("NEXT: SAFE AND FAST")).tap()

    await waitFor(element(by.text("NEXT: CREATE PASSWORD")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("NEXT: CREATE PASSWORD")).tap()
}

const goThroughPasswordSlides = async () => {
    await waitFor(element(by.text("NEXT: CUSTODY")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("NEXT: CUSTODY")).tap()

    await waitFor(element(by.text("NEXT: SAFETY")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("NEXT: SAFETY")).tap()

    await waitFor(element(by.text("NEXT: SECRET PHRASE")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("NEXT: SECRET PHRASE")).tap()
}

const skipToCreatePassword = async () => {
    await waitFor(element(by.text("GET STARTED")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("GET STARTED")).tap()

    await waitFor(element(by.text("Skip ahead to create password")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("Skip ahead to create password")).tap()
}

const skipToRecoveryPhrase = async () => {
    await element(by.text("Skip ahead to recovery phrase")).tap()
}

const selectCreateWallet = async () => {
    await element(by.text("Create new wallet")).tap()
}

const skipToCreateLocalWallet = async () => {
    await skipToCreatePassword()

    await selectCreateWallet()

    await skipToRecoveryPhrase()
}

const skipToImportLocalWallet = async () => {
    await skipToCreatePassword()

    await waitFor(element(by.text("Import wallet")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.text("Import wallet")).tap()

    console.log("DEBUGGING CI - OnboardingFlows:81")

    await waitFor(element(by.id("import-local-wallet")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)
    await element(by.id("import-local-wallet")).tap()

    console.log("DEBUGGING CI - OnboardingFlows:88")
}

const backupMnemonic = async (): Promise<string[]> => {
    await element(by.id("toggle-mnemonic-visibility")).tap()

    const mnemonic: string[] = await MnemonicScreen.copyMnemonic()

    await element(by.id("mnemonic-checkbox")).tap()

    await element(by.text("Backup")).tap()

    return mnemonic
}

/**
 * Verify the given mnemonic by interacting with the UI elements.
 * The method simulates a user selecting the words of the mnemonic in the correct order,
 * and then confirms the selection by tapping the "Confirm" button.
 * @param {string[]} mnemonic - The array of mnemonic words to be verified.
 * @returns {Promise<void>} - Resolves when the mnemonic has been successfully verified.
 */
const verifyMnemonic = async (mnemonic: string[]) => {
    const buttonGroupIds = [
        "first-word-button-group",
        "second-word-button-group",
        "third-word-button-group",
    ]

    let currentButtonGroupIndex = 0

    for (let i = 0; i < 12; i++) {
        await waitFor(element(by.text(`Select word ${i + 1}`)))
            .toExist()
            .withTimeout(SHORT_TIMEOUT)
            .then(async () => {
                console.log(`Selecting word ${i + 1}: ${mnemonic[i]}`)
                await element(
                    by
                        .text(mnemonic[i])
                        .withAncestor(
                            by.id(buttonGroupIds[currentButtonGroupIndex]),
                        ),
                ).tap()

                currentButtonGroupIndex++
            })
            .catch(() => {})
    }

    await element(by.text("Confirm")).tap()
}

const pasteMnemonic = async (mnemonic: string) => {
    await waitFor(element(by.id("import-mnemonic-input")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.id("import-mnemonic-input")).replaceText(mnemonic)

    //Close the keyboard by tapping somewhere outside of the input field
    await element(by.text("Import Local Wallet")).tap()

    await waitFor(element(by.text("Verify")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)

    await device.takeScreenshot("screenshot-verify-button")
    await element(by.text("Verify")).tap()
}

const chooseAndConfirmPassword = async (
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

const protectWithBiometrics = async () => {
    assert(detox.device.getPlatform() === "ios", "Not on iOS device")

    await detox.device.setBiometricEnrollment(true)

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

const matchBiometrics = async () => {
    if (element(by.text("Use Face ID"))) await detox.device.matchFace()
    if (element(by.text("Use Touch ID"))) await detox.device.matchFinger()
}

export default {
    goThroughOnboardingSlides,
    goThroughPasswordSlides,
    selectCreateWallet,
    skipToRecoveryPhrase,
    skipToCreatePassword,
    skipToCreateLocalWallet,
    skipToImportLocalWallet,
    backupMnemonic,
    verifyMnemonic,
    pasteMnemonic,
    chooseAndConfirmPassword,
    protectWithBiometrics,
    matchBiometrics,
}
