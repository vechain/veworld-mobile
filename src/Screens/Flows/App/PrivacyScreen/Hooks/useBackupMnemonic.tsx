import { useCallback, useEffect, useState } from "react"
import { CryptoUtils } from "~Common"
import { Device } from "~Model"

type Props = {
    closePasswordPrompt: () => void
    openWalletMgmtSheetWithDelay: (delay: number) => void
    openBackupPhraseSheetWithDelay: (delay: number) => void
    openPasswordPrompt: () => void
    closeWalletMgmtSheet: () => void
    devices: Device[]
    isWalletSecurityBiometrics: boolean
}

export const useBackupMnemonic = ({
    closePasswordPrompt,
    openWalletMgmtSheetWithDelay,
    openBackupPhraseSheetWithDelay,
    openPasswordPrompt,
    closeWalletMgmtSheet,
    devices,
    isWalletSecurityBiometrics,
}: Props) => {
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
                    openBackupPhraseSheetWithDelay(300)
                }
            }
        } else {
            openPasswordPrompt()
        }
    }, [
        devices,
        isWalletSecurityBiometrics,
        openBackupPhraseSheetWithDelay,
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
            console.log("onPasswordSuccess", password)

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
                    openBackupPhraseSheetWithDelay(300)
                }
            }
        },
        [
            closePasswordPrompt,
            devices,
            openBackupPhraseSheetWithDelay,
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
                openBackupPhraseSheetWithDelay(300)
            }
        },
        [closeWalletMgmtSheet, openBackupPhraseSheetWithDelay, userPin],
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
    }
}
