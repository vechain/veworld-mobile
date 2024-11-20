import React, { useCallback } from "react"
import { BaseButton, BaseText, BaseView, RequireUserPassword, useVeChat } from "~Components"
import { useDisclosure, useWalletSecurity } from "~Hooks"

const ChatOnboarding = () => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const { isOpen: isPasswordPromptOpen, onOpen: openPasswordPrompt, onClose: closePasswordPrompt } = useDisclosure()

    const { newClient } = useVeChat()

    const onConfirmAgreement = useCallback(() => {
        if (isWalletSecurityBiometrics) return newClient()
        openPasswordPrompt()
    }, [isWalletSecurityBiometrics, newClient, openPasswordPrompt])

    const onPasswordSuccess = useCallback(
        (password: string) => {
            closePasswordPrompt()
            newClient(password)
        },
        [closePasswordPrompt, newClient],
    )

    return (
        <BaseView p={24}>
            <BaseText>{"Welcome to the secure chatting service"}</BaseText>
            <BaseButton action={onConfirmAgreement}>{"Start sending messages"}</BaseButton>

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={closePasswordPrompt}
                onSuccess={onPasswordSuccess}
            />
        </BaseView>
    )
}

export default ChatOnboarding
