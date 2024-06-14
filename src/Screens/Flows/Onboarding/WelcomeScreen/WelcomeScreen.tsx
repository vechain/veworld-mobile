import React, { useCallback } from "react"
import { BackButtonHeader, BaseButton, BaseModal, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { VeWorldLogoSVG } from "~Assets"
import { useI18nContext } from "~i18n"
import { Linking } from "react-native"
import { useDemoWallet } from "./useDemoWallet"
import { UserCreatePasswordScreen } from "~Screens/Flows/WalletCreation"
import { useHandleWalletCreation } from "./useHandleWalletCreation"
import { useTheme } from "~Hooks"

export const WelcomeScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const theme = useTheme()

    const onNavigate = useCallback(() => {
        nav.navigate(Routes.WALLET_SETUP)
    }, [nav])

    const goToTermsAndConditions = useCallback(() => {
        const url = process.env.REACT_APP_TERMS_OF_SERVICE_URL
        url && Linking.openURL(url)
    }, [])

    const goToPrivacyPolicy = useCallback(() => {
        const url = process.env.REACT_APP_PRIVACY_POLICY_URL
        url && Linking.openURL(url)
    }, [])

    const DEV_DEMO_BUTTON = useDemoWallet()
    const { onCreateWallet, isOpen, isError, onSuccess, onClose } = useHandleWalletCreation()

    return (
        <>
            <Layout
                noBackButton
                fixedBody={
                    <BaseView alignItems="center" flex={1} mx={24}>
                        <BaseView flexDirection="row" mt={20}>
                            <BaseText typographyFont="largeTitle" testID="welcome-title-id">
                                {LL.TITLE_WELCOME_TO()}
                            </BaseText>
                            <BaseText typographyFont="largeTitle">{LL.VEWORLD()}</BaseText>
                        </BaseView>

                        <BaseView alignItems="center" w={100}>
                            <BaseText align="center" typographyFont="buttonSecondary" py={20}>
                                {LL.BD_WELCOME_SCREEN()}
                            </BaseText>
                        </BaseView>

                        <VeWorldLogoSVG height={240} width={240} />
                    </BaseView>
                }
                footer={
                    <BaseView alignItems="center" w={100}>
                        {!!isError && (
                            <BaseText my={10} color={theme.colors.danger}>
                                {isError}
                            </BaseText>
                        )}

                        <BaseButton
                            action={onCreateWallet}
                            w={100}
                            title={"CREATE WALLET"}
                            testID="CREATE_WALLET_BTN"
                            haptics="Medium"
                        />

                        <BaseSpacer height={12} />

                        <BaseButton
                            action={onNavigate}
                            w={100}
                            variant="ghost"
                            title={"IMPORT WALLET"}
                            testID="IMPORT_WALLET_BTN"
                            haptics="Medium"
                        />

                        <BaseSpacer height={42} />

                        <BaseView
                            alignSelf="center"
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                            flexWrap="wrap">
                            <BaseText typographyFont="body" align="center">
                                {LL.BD_CREATE_WALLET_TYPE_USER_ACCEPTS()}
                            </BaseText>
                            <BaseText
                                typographyFont="bodyMedium"
                                underline
                                align="center"
                                onPress={goToTermsAndConditions}>
                                {LL.COMMON_LBL_TERMS_AND_CONDITIONS()}
                            </BaseText>
                            <BaseText typographyFont="body" align="center">
                                {" "}
                                {LL.COMMON_LBL_AND()}{" "}
                            </BaseText>
                            <BaseText typographyFont="bodyMedium" underline align="center" onPress={goToPrivacyPolicy}>
                                {LL.COMMON_LBL_PRIVACY_POLICY()}
                            </BaseText>
                        </BaseView>

                        {DEV_DEMO_BUTTON}
                    </BaseView>
                }
            />

            <BaseModal isOpen={isOpen} onClose={onClose}>
                <BaseView justifyContent="flex-start">
                    <BackButtonHeader action={onClose} hasBottomSpacer={false} />
                    <UserCreatePasswordScreen onSuccess={onSuccess} />
                </BaseView>
            </BaseModal>
        </>
    )
}
