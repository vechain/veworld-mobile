import React, { useCallback, useEffect, useMemo } from "react"
import { useBiometricsValidation, useDisclosure } from "~Common"
import {
    BaseButtonGroupHorizontal,
    BaseSpacer,
    BaseText,
    RequireUserPassword,
} from "~Components"
import { useSecurityUpgrade } from "../Hooks/useSecurityUpgrade"
import { useI18nContext } from "~i18n"
import {
    BaseButtonGroupHorizontalType,
    UserSelectedSecurityLevel,
} from "~Model"

const buttons = (
    isWalletSecurityBiometrics: boolean,
): BaseButtonGroupHorizontalType[] => [
    {
        id: UserSelectedSecurityLevel.BIOMETRIC,
        label: "Face ID",
        icon: "face-recognition",
        disabled: false,
    },
    {
        id: UserSelectedSecurityLevel.PASSWORD,
        label: "Pin",
        icon: "dialpad",
        disabled: isWalletSecurityBiometrics,
    },
]

type Props = {
    isWalletSecurityBiometrics: boolean
}

export const EnableBiometrics = ({ isWalletSecurityBiometrics }: Props) => {
    const runSecurityUpgrade = useSecurityUpgrade()
    const { LL } = useI18nContext()
    const { authenticateBiometrics, isAuthenticated } =
        useBiometricsValidation()

    const {
        isOpen: isPasswordPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closePasswordPrompt,
    } = useDisclosure()

    const onPasswordSuccess = useCallback(
        async (password: string) => {
            await runSecurityUpgrade(password, closePasswordPrompt)
        },
        [runSecurityUpgrade, closePasswordPrompt],
    )

    const securityButtons = useMemo(
        () => buttons(isWalletSecurityBiometrics),
        [isWalletSecurityBiometrics],
    )

    const currentSecurity = useMemo(
        () =>
            isWalletSecurityBiometrics
                ? securityButtons[0].id
                : securityButtons[1].id,
        [isWalletSecurityBiometrics, securityButtons],
    )

    const requireBiometricsAndEnableIt = useCallback(async () => {
        authenticateBiometrics()
    }, [authenticateBiometrics])

    useEffect(() => {
        isAuthenticated && openPasswordPrompt()
    }, [isAuthenticated, openPasswordPrompt])

    const shouldCallRequireBiometricsAndEnableIt = useCallback(
        (button: BaseButtonGroupHorizontalType) => {
            if (
                button.id === UserSelectedSecurityLevel.BIOMETRIC &&
                !isWalletSecurityBiometrics
            )
                requireBiometricsAndEnableIt()
        },
        [isWalletSecurityBiometrics, requireBiometricsAndEnableIt],
    )

    return (
        <>
            <BaseText typographyFont="bodyMedium">
                {LL.SB_SECURITY_METHOD()}
            </BaseText>
            <BaseText typographyFont="caption">
                {LL.BD_SECURITY_METHOD()}
            </BaseText>

            <BaseSpacer height={24} />

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={closePasswordPrompt}
                onSuccess={onPasswordSuccess}
            />

            <BaseButtonGroupHorizontal
                selectedButtonIds={[currentSecurity]}
                buttons={securityButtons}
                action={shouldCallRequireBiometricsAndEnableIt}
            />
        </>
    )
}
