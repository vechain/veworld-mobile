import React, { useCallback } from "react"
import {
    CryptoUtils,
    useBottomSheetModal,
    useDisclosure,
    useWalletSecurity,
} from "~Common"
import { RequireUserPassword } from "~Components"
import { Wallet } from "~Model"
import {
    selectDevices,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"

type Props = {
    onIdentityConfirmed: (wallet: Wallet) => void
}
/**
 * hook used to handle reusable identity flow
 */
export const useCheckIdentity = ({ onIdentityConfirmed }: Props) => {
    const account = useAppSelector(selectSelectedAccount)
    const devices = useAppSelector(selectDevices())
    const { isWalletSecurityBiometrics } = useWalletSecurity()

    const {
        ref: walletMgmtBottomSheetRef,
        openWithDelay: openWalletMgmtSheetWithDelay,
        onClose: closeWalletMgmtSheet,
    } = useBottomSheetModal()
    const {
        isOpen: isPasswordPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closePasswordPrompt,
    } = useDisclosure()

    /**
     * function that decrypt wallet either with password or without it (in case of biometrics)
     */
    const decryptWallet = useCallback(
        async (password?: string) => {
            if (!account?.rootAddress) {
                throw new Error(
                    "can not decript wallet: account.rootAddress undefined",
                )
            }
            const device = devices.find(
                _device => _device.rootAddress === account.rootAddress,
            )
            if (!device) {
                throw new Error(
                    `can not find device with rootAddress: ${account.rootAddress}`,
                )
            }
            const { decryptedWallet } = await CryptoUtils.decryptWallet(
                device,
                password,
            )
            if (decryptedWallet) {
                onIdentityConfirmed(decryptedWallet)
            }
        },
        [account?.rootAddress, devices, onIdentityConfirmed],
    )

    /*
     * This function checks if the user has enabled biometrics and if so, it will
     * open the biometrics prompt. If the user has not enabled biometrics, it will
     * open the password prompt.
     */
    const checkSecurityBeforeOpening = useCallback(async () => {
        if (isWalletSecurityBiometrics) {
            decryptWallet()
        } else {
            openPasswordPrompt()
        }
    }, [decryptWallet, isWalletSecurityBiometrics, openPasswordPrompt])

    /*
     * This function is called when the user enters the correct password. It will
     * close the password prompt and if the user has multiple wallets, it will
     * open the wallet management sheet. If the user has only one wallet, it will
     * decrypt the wallet
     */
    const onPasswordSuccess = useCallback(
        async (password: string) => {
            closePasswordPrompt()
            decryptWallet(password)
        },
        [closePasswordPrompt, decryptWallet],
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
        checkSecurityBeforeOpening,
        isPasswordPromptOpen,
        openPasswordPrompt,
        closePasswordPrompt,
        walletMgmtBottomSheetRef,
        openWalletMgmtSheetWithDelay,
        closeWalletMgmtSheet,
        ConfirmIdentityBottomSheet,
    }
}
