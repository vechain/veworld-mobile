import React, { useCallback } from "react"
import { useDisclosure, useWalletSecurity } from "~Hooks"
import { BiometricsUtils } from "~Utils"
import { RequireUserPassword } from "~Components"

type Props = {
    onIdentityConfirmed: (password?: string) => void
}
/**
 * hook used to handle reusable identity flow
 */
export const useCheckIdentity = ({ onIdentityConfirmed }: Props) => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()

    const {
        isOpen: isPasswordPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closePasswordPrompt,
    } = useDisclosure()

    /*
     * This function checks if the user has enabled biometrics and if so, it will
     * open the biometrics prompt. If the user has not enabled biometrics, it will
     * open the password prompt.
     *
     */
    const checkIdentityBeforeOpening = useCallback(async () => {
        if (isWalletSecurityBiometrics) {
            let { success } = await BiometricsUtils.authenticateWithBiometrics()
            if (success) {
                onIdentityConfirmed()
            }
        } else {
            openPasswordPrompt()
        }
    }, [isWalletSecurityBiometrics, openPasswordPrompt, onIdentityConfirmed])

    /*
     * This function is called when the user enters the correct password. It will
     * close the password prompt and if the user has multiple wallets, it will
     * open the wallet management sheet. If the user has only one wallet, it will
     * decrypt the wallet
     */
    const onPasswordSuccess = useCallback(
        async (password: string) => {
            closePasswordPrompt()
            onIdentityConfirmed(password)
        },
        [closePasswordPrompt, onIdentityConfirmed],
    )

    const ConfirmIdentityBottomSheet = () => (
        <RequireUserPassword
            isOpen={isPasswordPromptOpen}
            onClose={closePasswordPrompt}
            onSuccess={onPasswordSuccess}
        />
    )

    return {
        onPasswordSuccess,
        checkIdentityBeforeOpening,
        isPasswordPromptOpen,
        openPasswordPrompt,
        closePasswordPrompt,
        ConfirmIdentityBottomSheet,
    }
}
