import { isEmpty } from "lodash"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDisclosure, useWalletSecurity } from "~Hooks"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"
import { useEncryptedStorage } from "~Components"

/**
 * `useEditPin` is a custom React hook that handles the process of editing the Pin for the wallet.
 * It returns several values and functions that can be used to control the Pin editing process.
 *
 * @returns {object} An object containing several state variables and functions for controlling the Pin editing process.
 * @returns {Function} onEditPinPress - A function to start the pin editing process. If the current security is biometrics, the function will not do anything.
 * @returns {boolean} isEditPinPromptOpen - A boolean indicating whether the edit pin prompt is open.
 * @returns {Function} closeEditPinPrompt - A function to close the edit pin prompt.
 * @returns {Function} onPinSuccess - A function to be called when the pin input is successful. It handles the logic for editing the pin.
 * @returns {string} lockScreenScenario - A string representing the current scenario of the lock screen.
 * @returns {boolean} isValidatePassword - A boolean indicating whether the current scenario is to validate the old pin.
 *
 * @example
 * ```jsx
 * const {
 *   onEditPinPress,
 *   isEditPinPromptOpen,
 *   closeEditPinPrompt,
 *   onPinSuccess,
 *   lockScreenScenario,
 *   isValidatePassword,
 * } = useEditPin();
 * ```
 *
 * @requires `useWalletSecurity` hook for determining the current security state of the wallet.
 * @requires `useAppSelector` hook with `selectLocalDevices` selector for fetching the local devices where the wallet is stored.
 *
 */
export const useEditPin = () => {
    // [START] - Hooks
    const { isWalletSecurityBiometrics } = useWalletSecurity()

    const [lockScreenScenario, setScenario] = useState(
        LOCKSCREEN_SCENARIO.EDIT_OLD_PIN,
    )

    const [oldPin, setOldPin] = useState("")

    const {
        isOpen: isEditPinPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closeEditPinPrompt,
    } = useDisclosure()

    // [END] - Hooks

    // [START] - Internal Methods
    const onEditPinPress = useCallback(() => {
        if (isWalletSecurityBiometrics) return

        openPasswordPrompt()
    }, [isWalletSecurityBiometrics, openPasswordPrompt])

    const isValidatePassword = useMemo(
        () => lockScreenScenario === LOCKSCREEN_SCENARIO.EDIT_OLD_PIN,
        [lockScreenScenario],
    )

    const onStateCleanup = useCallback(() => {
        // close edit pin prompt
        closeEditPinPrompt()

        // reset pin screen scenario
        setScenario(LOCKSCREEN_SCENARIO.EDIT_OLD_PIN)

        // reset old pin
        setOldPin("")
    }, [closeEditPinPrompt])

    const { updateSecurityMethod } = useEncryptedStorage()

    const changePinInWallets = useCallback(
        async (_oldPin: string, newPin: string) => {
            if (isWalletSecurityBiometrics) return

            await updateSecurityMethod(_oldPin, newPin)

            onStateCleanup()
        },
        [onStateCleanup, updateSecurityMethod, isWalletSecurityBiometrics],
    )

    const onPinSuccess = useCallback(
        async (pin: string) => {
            if (!pin) return

            if (isEmpty(oldPin)) {
                // get current pin
                setOldPin(pin)
                setScenario(LOCKSCREEN_SCENARIO.EDIT_NEW_PIN)
            } else {
                // user can't use the same pin as the old one
                if (pin === oldPin) {
                    setOldPin("")
                    setScenario(LOCKSCREEN_SCENARIO.EDIT_OLD_PIN)
                    return
                }

                // is new pin
                await changePinInWallets(oldPin, pin)
            }
        },
        [changePinInWallets, oldPin],
    )

    // [END] - Internal Methods

    // Reset state when the edit pin prompt is closed
    useEffect(() => {
        if (!isEditPinPromptOpen) {
            setOldPin("")
            setScenario(LOCKSCREEN_SCENARIO.EDIT_OLD_PIN)
        }
    }, [isEditPinPromptOpen])

    // set default statae on startup
    useEffect(() => {
        // clean up state
        setScenario(LOCKSCREEN_SCENARIO.EDIT_OLD_PIN)
        setOldPin("")
    }, [])

    return {
        onEditPinPress,
        isEditPinPromptOpen,
        closeEditPinPrompt,
        onPinSuccess,
        lockScreenScenario,
        isValidatePassword,
    }
}
