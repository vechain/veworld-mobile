import React, { useCallback } from "react"
import { Switch } from "react-native"
import { BiometricsUtils, useDisclosure, useWalletSecurity } from "~Common"
import { BaseText, BaseView } from "~Components"
import { RequireUserPassword } from "../../HomeScreen/Components"

export const EnableBiometrics = () => {
    const {
        isBiometricsEnabled,
        isWalletSecurityBiometrics,
        runSecurityUpgrade,
    } = useWalletSecurity()

    const {
        isOpen: isPasswordPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closePasswordPrompt,
    } = useDisclosure()

    const requireBiometricsAndEnableIt = useCallback(async () => {
        let { success } = await BiometricsUtils.authenticateWithBiometric()
        if (success) openPasswordPrompt()
    }, [openPasswordPrompt])

    const onPasswordSuccess = useCallback(
        (password: string) => runSecurityUpgrade(password, closePasswordPrompt),
        [runSecurityUpgrade, closePasswordPrompt],
    )
    if (isBiometricsEnabled)
        return (
            <>
                <RequireUserPassword
                    isOpen={isPasswordPromptOpen}
                    onClose={closePasswordPrompt}
                    onSuccess={onPasswordSuccess}
                />
                <BaseView
                    justify="space-between"
                    w={100}
                    align="center"
                    orientation="row">
                    <BaseText>Enable Biometrics</BaseText>
                    <Switch
                        disabled={isWalletSecurityBiometrics}
                        onValueChange={requireBiometricsAndEnableIt}
                        value={isWalletSecurityBiometrics}
                    />
                </BaseView>
            </>
        )

    return <></>
}
