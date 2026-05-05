import { CommonActions, useNavigation } from "@react-navigation/native"
import React, { useCallback, useState } from "react"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, Layout, RequireUserPassword } from "~Components"
import { useB3moAuth, useB3moUnlock, useCheckIdentity, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const B3moUnlockScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()
    const { unlock } = useB3moUnlock()
    const { signIn } = useB3moAuth()
    const [error, setError] = useState<string | undefined>()
    const [pending, setPending] = useState(false)

    const onIdentityConfirmed = useCallback(
        async (pin?: string) => {
            try {
                const walletKey = await unlock(pin)
                await signIn(walletKey)
                nav.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: Routes.B3MO_CHAT }],
                    }),
                )
            } catch (e) {
                setError(e instanceof Error ? e.message : LL.B3MO_AGENT_UNLOCK_FAIL())
            } finally {
                setPending(false)
            }
        },
        [unlock, signIn, nav, LL],
    )

    const { isPasswordPromptOpen, handleClosePasswordModal, onPasswordSuccess, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed,
            onCancel: () => setPending(false),
            allowAutoPassword: false,
        })

    const onUnlock = useCallback(async () => {
        setError(undefined)
        setPending(true)
        await checkIdentityBeforeOpening()
    }, [checkIdentityBeforeOpening])

    return (
        <Layout
            title={LL.B3MO_AGENT_UNLOCK_TITLE()}
            body={
                <BaseView pt={24} alignItems="center">
                    <BaseIcon name="icon-bot" size={64} color={theme.colors.primary} />
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="body" align="center">
                        {LL.B3MO_AGENT_UNLOCK_BODY()}
                    </BaseText>
                    {error && (
                        <>
                            <BaseSpacer height={16} />
                            <BaseText typographyFont="captionRegular" color={theme.colors.danger}>
                                {error}
                            </BaseText>
                        </>
                    )}
                </BaseView>
            }
            footer={
                <BaseView>
                    <BaseButton
                        title={LL.B3MO_AGENT_UNLOCK_CTA()}
                        action={onUnlock}
                        isLoading={pending}
                        testID="b3mo-unlock-cta"
                    />
                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen}
                        onClose={handleClosePasswordModal}
                        onSuccess={onPasswordSuccess}
                    />
                </BaseView>
            }
        />
    )
}
