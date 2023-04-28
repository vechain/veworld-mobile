import React, { useCallback, useEffect, useState } from "react"
import {
    CryptoUtils,
    useBottomSheetModal,
    useDisclosure,
    useWalletSecurity,
} from "~Common"
import { RequireUserPassword, WalletMgmtBottomSheet } from "~Components"
import { Device, Wallet } from "~Model"
import { selectDevices, useAppSelector } from "~Storage/Redux"

type Props = {
    onIdentityConfirmed: (wallet: Wallet) => void
}

export const useCheckIdentity = ({ onIdentityConfirmed }: Props) => {
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
    const [userPin, setUserPin] = useState<string | undefined>(undefined)
    const [mnemonicArray, setMnemonicArray] = useState<string[]>([""])

    /*
    * This function checks if the user has enabled biometrics and if so, it will
    * open the biometrics prompt. If the user has not enabled biometrics, it will
    * open the password prompt.

    * If the user has only one wallet, it will decrypt the wallet and open the
    * backup phrase sheet. If the user has multiple wallets, it will open the
    * wallet management sheet.
    */
    const checkSecurityBeforeOpening = useCallback(async () => {
        if (isWalletSecurityBiometrics) {
            if (devices.length > 1) {
                openWalletMgmtSheetWithDelay(300)
            } else {
                const { decryptedWallet } = await CryptoUtils.decryptWallet(
                    devices[0],
                )
                if (decryptedWallet) {
                    setMnemonicArray(decryptedWallet.mnemonic)
                    onIdentityConfirmed(decryptedWallet)
                }
            }
        } else {
            openPasswordPrompt()
        }
    }, [
        devices,
        isWalletSecurityBiometrics,
        onIdentityConfirmed,
        openPasswordPrompt,
        openWalletMgmtSheetWithDelay,
    ])

    /*
     * This function is called when the user enters the correct password. It will
     * close the password prompt and if the user has multiple wallets, it will
     * open the wallet management sheet. If the user has only one wallet, it will
     * decrypt the wallet and open the backup phrase sheet.
     */
    const onPasswordSuccess = useCallback(
        async (password: string) => {
            setUserPin(password)
            closePasswordPrompt()

            if (devices.length > 1) {
                openWalletMgmtSheetWithDelay(300)
            } else {
                const { decryptedWallet } = await CryptoUtils.decryptWallet(
                    devices[0],
                    password,
                )

                if (decryptedWallet) {
                    setMnemonicArray(decryptedWallet.mnemonic)
                    onIdentityConfirmed(decryptedWallet)
                }
            }
        },
        [
            closePasswordPrompt,
            devices,
            onIdentityConfirmed,
            openWalletMgmtSheetWithDelay,
        ],
    )

    /*
     * This function is called when the user selects a wallet from the wallet
     * management sheet. It will close the wallet management sheet and decrypt
     * the wallet using the user's PIN if exists.
     */
    const handleOnSelectedWallet = useCallback(
        async (device: Device) => {
            closeWalletMgmtSheet()

            const { decryptedWallet } = await CryptoUtils.decryptWallet(
                device,
                userPin,
            )

            if (decryptedWallet) {
                setMnemonicArray(decryptedWallet.mnemonic)
                onIdentityConfirmed(decryptedWallet)
            }
        },
        [closeWalletMgmtSheet, onIdentityConfirmed, userPin],
    )

    const IdentityBottomSheets = () => (
        <>
            <WalletMgmtBottomSheet
                ref={walletMgmtBottomSheetRef}
                onClose={handleOnSelectedWallet}
                devices={devices}
            />
            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={closePasswordPrompt}
                onSuccess={onPasswordSuccess}
            />
        </>
    )

    useEffect(() => {
        return () => {
            setMnemonicArray([""])
            setUserPin(undefined)
        }
    }, [])

    return {
        onPasswordSuccess,
        checkSecurityBeforeOpening,
        handleOnSelectedWallet,
        mnemonicArray,
        isPasswordPromptOpen,
        openPasswordPrompt,
        closePasswordPrompt,
        walletMgmtBottomSheetRef,
        openWalletMgmtSheetWithDelay,
        closeWalletMgmtSheet,
        IdentityBottomSheets,
    }
}
