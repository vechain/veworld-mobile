import { useCallback, useMemo } from "react"
import { useDisclosure, useWalletSecurity } from "~Hooks"
import { isEmpty } from "lodash"
import { usePinCode } from "~Components/Providers/PinCodeProvider/PinCodeProvider"
import { selectSelectedAccountOrNull, useAppSelector } from "~Storage/Redux"
import { DEVICE_TYPE } from "~Model"

type Props = {
    onIdentityConfirmed: (password?: string) => void
    onCancel?: () => void
    allowAutoPassword: boolean
}
/**
 * hook used to handle reusable identity flow
 */
export const useCheckIdentity = ({
    onIdentityConfirmed,
    onCancel,
    allowAutoPassword,
}: Props) => {
    const { isWalletSecurityBiometrics, biometrics } = useWalletSecurity()

    const { getPinCode } = usePinCode()

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)

    const isBiometricsEmpty = useMemo(() => {
        return isEmpty(biometrics)
    }, [biometrics])

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
        const pinCode = getPinCode()

        // If: we're using biometrics, or we allow auto access to ledger
        // Else If: the pin code is stored in the app
        // Else: Open the password prompt
        if (
            isWalletSecurityBiometrics ||
            (allowAutoPassword &&
                selectedAccount?.device.type === DEVICE_TYPE.LEDGER)
        ) {
            onIdentityConfirmed()
        } else if (pinCode && allowAutoPassword) {
            onIdentityConfirmed(pinCode)
        } else {
            openPasswordPrompt()
        }
    }, [
        selectedAccount,
        allowAutoPassword,
        getPinCode,
        isWalletSecurityBiometrics,
        openPasswordPrompt,
        onIdentityConfirmed,
    ])

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

    const handleClosePasswordModal = useCallback(() => {
        onCancel?.()
        closePasswordPrompt()
    }, [closePasswordPrompt, onCancel])

    return {
        onPasswordSuccess,
        checkIdentityBeforeOpening,
        isPasswordPromptOpen,
        openPasswordPrompt,
        closePasswordPrompt,
        isBiometricsEmpty,
        handleClosePasswordModal,
    }
}
