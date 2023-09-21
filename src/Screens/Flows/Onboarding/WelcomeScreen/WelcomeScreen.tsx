import React, { useCallback } from "react"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    WalletEncryptionKeyHelper,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { VeWorldLogoSVG } from "~Assets"
import { useI18nContext } from "~i18n"
import {
    addDeviceAndAccounts,
    selectAreDevFeaturesEnabled,
    setSelectedAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useDeviceUtils } from "~Hooks"
import { Linking } from "react-native"

export const WelcomeScreen = () => {
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const onNavigate = useCallback(() => {
        nav.navigate(Routes.WALLET_SETUP)
    }, [nav])

    /**
     * onboarding with the demo account and password 111111 for TDD purposes
     */
    const { getDeviceFromMnemonic } = useDeviceUtils()
    const onDemoOnboarding = async () => {
        const FAKE_PIN = "111111"

        const DEMO_MNEMONIC =
            "denial kitchen pet squirrel other broom bar gas better priority spoil cross"
        const { device, wallet } = getDeviceFromMnemonic(DEMO_MNEMONIC)

        await WalletEncryptionKeyHelper.init(FAKE_PIN)

        const encryptedWallet = await WalletEncryptionKeyHelper.encryptWallet(
            wallet,
            FAKE_PIN,
        )

        const newAccount = dispatch(
            addDeviceAndAccounts({
                ...device,
                wallet: encryptedWallet,
            }),
        )

        dispatch(setSelectedAccount({ address: newAccount.address }))
        const parent = nav.getParent()
        if (parent) {
            if (parent.canGoBack()) {
                parent.goBack()
            }
        }
    }

    const goToTermsAndConditions = useCallback(() => {
        const url = process.env.REACT_APP_TERMS_OF_SERVICE_URL
        url && Linking.openURL(url)
    }, [])

    const goToPrivacyPolicy = useCallback(() => {
        const url = process.env.REACT_APP_PRIVACY_POLICY_URL
        url && Linking.openURL(url)
    }, [])

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
