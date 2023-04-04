import React, { useCallback } from "react"
import { useDisclosure } from "~Common"
import {
    BaseButtonGroupHorizontal,
    BaseSpacer,
    BaseText,
    RequireUserPassword,
} from "~Components"
import { useSecurityUpgrade } from "../Hooks/useSecurityUpgrade"
import { useI18nContext } from "~i18n"
import { useSecurityButtons } from "../Hooks/useGetSecurityButtons"

export const EnableBiometrics = () => {
    const runSecurityUpgrade = useSecurityUpgrade()
    const { LL } = useI18nContext()

    const {
        isOpen: isPasswordPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closePasswordPrompt,
    } = useDisclosure()

    const handleOnSecurityUpgrade = useCallback(() => {
        openPasswordPrompt()
    }, [openPasswordPrompt])

    const { securityButtons, shouldCallRequireBiometricsAndEnableIt } =
        useSecurityButtons(handleOnSecurityUpgrade)

    const onPasswordSuccess = useCallback(
        async (password: string) => {
            await runSecurityUpgrade(password, () => {
                // weird crashes happen occasionally without this timeout, also the reason why we use the closure here
                // https://stackoverflow.com/questions/61170501/exception-thrown-while-executing-ui-block-parentnode-is-a-required-a-required
                setTimeout(() => {
                    closePasswordPrompt()
                }, 10)
            })
        },
        [runSecurityUpgrade, closePasswordPrompt],
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
                selectedButtonIds={[securityButtons.currentSecurity]}
                buttons={securityButtons.buttons}
                action={shouldCallRequireBiometricsAndEnableIt}
            />
        </>
    )
}
