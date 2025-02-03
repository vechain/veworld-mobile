import { useCallback, useEffect, useState } from "react"
import { WalletEncryptionKeyHelper } from "~Components"
import { LocalDevice } from "~Model"

type Props = {
    closePasswordPrompt: () => void
    openWalletMgmtSheetWithDelay: (delay: number) => void
    openBackupPhraseSheetWithDelay: (delay: number, credential: string[] | string, deviceToBackup: LocalDevice) => void
    openPasswordPrompt: () => void
    closeWalletMgmtSheet: () => void
    devices: LocalDevice[]
    isWalletSecurityBiometrics: boolean
}

export const useBackupCredential = ({
    closePasswordPrompt,
    openWalletMgmtSheetWithDelay,
    openBackupPhraseSheetWithDelay,
    openPasswordPrompt,
    closeWalletMgmtSheet,
    devices,
    isWalletSecurityBiometrics,
}: Props) => {
    const [deviceToBackup, setDeviceToBackup] = useState<LocalDevice | undefined>()

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
                const wallet = await WalletEncryptionKeyHelper.decryptWallet({ encryptedWallet: devices[0].wallet })

                if (wallet?.mnemonic) {
                    setDeviceToBackup(devices[0])
                    openBackupPhraseSheetWithDelay(300, wallet.mnemonic, devices[0])
                } else if (wallet?.privateKey) {
                    setDeviceToBackup(devices[0])
                    openBackupPhraseSheetWithDelay(300, wallet.privateKey, devices[0])
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
            closePasswordPrompt()

            if (deviceToBackup) {
                const wallet = await WalletEncryptionKeyHelper.decryptWallet({
                    encryptedWallet: deviceToBackup.wallet,
                    pinCode: password,
                })

                if (wallet?.mnemonic?.length) {
                    openBackupPhraseSheetWithDelay(300, wallet.mnemonic, deviceToBackup)
                }
            }
        },
        [closePasswordPrompt, openBackupPhraseSheetWithDelay, deviceToBackup],
    )

    /*
     * This function is called when the user selects a wallet from the wallet
     * management sheet. It will close the wallet management sheet and decrypt
     * the wallet using the user's PIN if exists.
     */
    const handleOnSelectedWallet = useCallback(
        async (device: LocalDevice) => {
            setDeviceToBackup(device)
            closeWalletMgmtSheet()
            if (isWalletSecurityBiometrics) {
                const wallet = await WalletEncryptionKeyHelper.decryptWallet({
                    encryptedWallet: device.wallet,
                })

                if (wallet?.mnemonic) {
                    openBackupPhraseSheetWithDelay(300, wallet.mnemonic, device)
                }
            } else {
                openPasswordPrompt()
            }
        },
        [closeWalletMgmtSheet, isWalletSecurityBiometrics, openBackupPhraseSheetWithDelay, openPasswordPrompt],
    )

    useEffect(() => {
        return () => {
            setDeviceToBackup(undefined)
        }
    }, [])

    return {
        onPasswordSuccess,
        checkSecurityBeforeOpening,
        handleOnSelectedWallet,
        deviceToBackup,
    }
}
