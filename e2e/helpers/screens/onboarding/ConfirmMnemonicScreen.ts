import { SHORT_TIMEOUT } from "../../constants"

/**
 * Verify the given mnemonic by interacting with the UI elements.
 * The method simulates a user selecting the words of the mnemonic in the correct order,
 * and then confirms the selection by tapping the "Confirm" button.
 * @param {string[]} mnemonic - The array of mnemonic words to be verified.
 * @returns {Promise<void>} - Resolves when the mnemonic has been successfully verified.
 */
export const verifyMnemonic = async (mnemonic: string[]) => {
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
                // eslint-disable-next-line no-console
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
