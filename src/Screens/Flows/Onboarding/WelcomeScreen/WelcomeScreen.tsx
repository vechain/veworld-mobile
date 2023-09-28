import React, { useCallback } from "react"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    WalletEncryptionKeyHelper,
    useApplicationSecurity,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { VeWorldLogoSVG } from "~Assets"
import { useI18nContext } from "~i18n"
import { Linking } from "react-native"
import {
    selectAreDevFeaturesEnabled,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useCreateWallet } from "~Hooks"
import { error } from "~Utils"
import { SecurityLevelType } from "~Model"

export const WelcomeScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

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

    // dev button
    const dispatch = useAppDispatch()
    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)
    const { onCreateWallet: createWallet } = useCreateWallet()
    const { migrateOnboarding } = useApplicationSecurity()

    const onDemoOnboarding = useCallback(async () => {
        dispatch(setIsAppLoading(true))
        const mnemonic =
            "denial kitchen pet squirrel other broom bar gas better priority spoil cross"
        const userPassword = "111111"
        await WalletEncryptionKeyHelper.init(userPassword)
        await createWallet({
            userPassword,
            onError: e => error(e),
            mnemonic,
        })
        await migrateOnboarding(SecurityLevelType.SECRET, userPassword)
        dispatch(setIsAppLoading(false))
    }, [createWallet, dispatch, migrateOnboarding])
    // end dev button

    return (
        <Layout
            noBackButton
            fixedBody={
                <BaseView alignItems="center" flex={1} mx={24}>
                    <BaseView flexDirection="row" mt={20}>
                        <BaseText
                            typographyFont="largeTitle"
                            testID="welcome-title-id">
                            {LL.TITLE_WELCOME_TO()}
                        </BaseText>
                        <BaseText typographyFont="largeTitle">
                            {LL.VEWORLD()}
                        </BaseText>
                    </BaseView>

                    <BaseSpacer height={40} />
                    <VeWorldLogoSVG height={200} width={200} />

                    <BaseView alignItems="center" w={100}>
                        <BaseSpacer height={40} />
                        <BaseText
                            align="center"
                            typographyFont="buttonSecondary"
                            py={20}>
                            {LL.BD_WELCOME_SCREEN()}
                        </BaseText>
                    </BaseView>
                </BaseView>
            }
            footer={
                <BaseView alignItems="center" w={100}>
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
                        <BaseText
                            typographyFont="bodyMedium"
                            underline
                            align="center"
                            onPress={goToPrivacyPolicy}>
                            {LL.COMMON_LBL_PRIVACY_POLICY()}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={20} />
                    <BaseButton
                        action={onNavigate}
                        w={100}
                        title={LL.BTN_GET_STARTED()}
                        testID="GET_STARTED_BTN"
                        haptics="Medium"
                    />
                    {devFeaturesEnabled && (
                        <BaseButton
                            size="md"
                            variant="link"
                            action={onDemoOnboarding}
                            title="DEV:DEMO"
                        />
                    )}
                </BaseView>
            }
        />
    )
}
