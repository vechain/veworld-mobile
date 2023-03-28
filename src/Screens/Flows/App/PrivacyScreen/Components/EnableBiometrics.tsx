import React, { useCallback } from "react"
import { BiometricsUtils, useDisclosure, useWalletSecurity } from "~Common"
import {
    BaseSwitch,
    BaseText,
    BaseView,
    RequireUserPassword,
} from "~Components"
import { useSecurityUpgrade } from "../Hooks/useSecurityUpgrade"

export const EnableBiometrics = () => {
    const { isBiometricsEnabled, isWalletSecurityBiometrics } =
        useWalletSecurity()
    const runSecurityUpgrade = useSecurityUpgrade()

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
        async (password: string) => {
            await runSecurityUpgrade(password, closePasswordPrompt)
        },
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
                    justifyContent="space-between"
                    w={100}
                    alignItems="center"
                    flexDirection="row">
                    <BaseText>Enable Biometrics</BaseText>
                    <BaseSwitch
                        disabled={isWalletSecurityBiometrics}
                        onValueChange={requireBiometricsAndEnableIt}
                        value={isWalletSecurityBiometrics}
                    />
                </BaseView>
            </>
        )

    return <></>
}
