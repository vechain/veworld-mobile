import React from "react"
import { Alert } from "react-native"
import { CryptoUtils, error, useDisclosure, useWalletSecurity } from "~Common"
import { BaseButton, RequireUserPassword } from "~Components"
import { LocalDevice } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import { selectLocalDevices } from "~Storage/Redux/Selectors"

export const DecryptWallet: React.FC = () => {
    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]
    const { isWalletSecurityBiometrics, isWalletSecurityPassword } =
        useWalletSecurity()

    const {
        isOpen: isPasswordPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closePasswordPrompt,
    } = useDisclosure()

    const onDecryptWallet = async (password?: string) => {
        for (const device of devices) {
            try {
                await CryptoUtils.decryptWallet(device, password)
            } catch (e: any) {
                error(e)
                Alert.alert(
                    "Error!",
                    "There was an error decrypting one or more wallets",
                )
            }
        }
        closePasswordPrompt()
        Alert.alert("Success!", "All devices have been decrypted correctly")
    }

    const onButtonClick = () => {
        if (isWalletSecurityBiometrics) onDecryptWallet()
        else if (isWalletSecurityPassword) openPasswordPrompt()
        else
            throw new Error(
                "No wallet security is set. You shouldn't be able to get here.",
            )
    }

    return (
        <>
            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={closePasswordPrompt}
                onSuccess={onDecryptWallet}
            />

            <BaseButton action={onButtonClick} title="DEV:Decrypt wallet" />
        </>
    )
}
