import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useState } from "react"
import { BaseButton, BaseSpacer, BaseText, BaseView, Layout, RequireUserPassword } from "~Components"
import { DerivationPath } from "~Constants"
import { useCheckIdentity, useTheme } from "~Hooks"
import { useHandleWalletCreation } from "~Screens/Flows/Onboarding/WelcomeScreen/useHandleWalletCreation"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

type Nav = NativeStackNavigationProp<{
    [Routes.B3MO_ONBOARDING_PICK_WALLET]: undefined
    [Routes.CREATE_WALLET_FLOW]: undefined
}>

export const B3moWalletChoiceScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation<Nav>()
    const theme = useTheme()
    const { createOnboardedWallet } = useHandleWalletCreation()
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<string | undefined>()

    const onIdentityConfirmed = useCallback(
        async (pin?: string) => {
            setError(undefined)
            setCreating(true)
            try {
                await createOnboardedWallet({ pin, derivationPath: DerivationPath.VET })
                nav.navigate(Routes.B3MO_ONBOARDING_PICK_WALLET)
            } catch (e) {
                setError(e instanceof Error ? e.message : LL.B3MO_AGENT_ERROR_GENERIC())
            } finally {
                setCreating(false)
            }
        },
        [createOnboardedWallet, nav, LL],
    )

    const { isPasswordPromptOpen, handleClosePasswordModal, onPasswordSuccess, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed,
            onCancel: () => setCreating(false),
            allowAutoPassword: false,
        })

    const onCreate = useCallback(async () => {
        setError(undefined)
        await checkIdentityBeforeOpening()
    }, [checkIdentityBeforeOpening])

    const onImport = useCallback(() => {
        nav.navigate(Routes.CREATE_WALLET_FLOW)
    }, [nav])

    const onUseExisting = useCallback(() => {
        nav.navigate(Routes.B3MO_ONBOARDING_PICK_WALLET)
    }, [nav])

    return (
        <Layout
            title={LL.B3MO_AGENT_WALLET_CHOICE_TITLE()}
            body={
                <BaseView pt={24}>
                    <BaseText typographyFont="bodyMedium">{LL.B3MO_AGENT_WALLET_CHOICE_SUBTITLE()}</BaseText>
                    {error ? (
                        <>
                            <BaseSpacer height={12} />
                            <BaseText typographyFont="captionRegular" color={theme.colors.danger}>
                                {error}
                            </BaseText>
                        </>
                    ) : null}
                </BaseView>
            }
            footer={
                <BaseView>
                    <BaseButton
                        title={LL.B3MO_AGENT_WALLET_CHOICE_CREATE()}
                        action={onCreate}
                        isLoading={creating}
                        testID="b3mo-create-wallet"
                    />
                    <BaseSpacer height={12} />
                    <BaseButton
                        variant="outline"
                        title={LL.BTN_IMPORT_WALLET()}
                        action={onImport}
                        disabled={creating}
                        testID="b3mo-import-wallet"
                    />
                    <BaseSpacer height={12} />
                    <BaseButton
                        variant="ghost"
                        title={LL.B3MO_AGENT_WALLET_CHOICE_EXISTING()}
                        action={onUseExisting}
                        disabled={creating}
                        testID="b3mo-existing-wallet"
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
