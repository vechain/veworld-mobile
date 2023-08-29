import React, { useCallback } from "react"
import { BaseButton, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { VeWorldLogoSVG } from "~Assets"
import { useI18nContext } from "~i18n"
import {
    addDeviceAndAccounts,
    setSelectedAccount,
    selectAreDevFeaturesEnabled,
    setAppLockStatus,
    setPinValidationString,
    setUserSelectedSecurity,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { CryptoUtils } from "~Utils"
import { useDeviceUtils } from "~Hooks"
import { SettingsConstants } from "~Constants"
import { SecurityLevelType, WALLET_STATUS } from "~Model"

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
        const pinValidationString = CryptoUtils.encrypt<string>(
            SettingsConstants.VALIDATION_STRING,
            FAKE_PIN,
        )
        dispatch(setPinValidationString(pinValidationString))
        dispatch(setUserSelectedSecurity(SecurityLevelType.SECRET))

        const DEMO_MNEMONIC =
            "denial kitchen pet squirrel other broom bar gas better priority spoil cross"
        const { device, wallet } = getDeviceFromMnemonic(DEMO_MNEMONIC)
        const { encryptedWallet } = await CryptoUtils.encryptWallet({
            wallet,
            rootAddress: device.rootAddress,
            accessControl: false,
            hashEncryptionKey: FAKE_PIN,
        })

        const newAccount = dispatch(
            addDeviceAndAccounts({
                ...device,
                wallet: encryptedWallet,
            }),
        )

        dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))
        dispatch(setSelectedAccount({ address: newAccount.address }))
        const parent = nav.getParent()
        if (parent) {
            if (parent.canGoBack()) {
                parent.goBack()
            }
        }
    }

    return (
        <Layout
            noBackButton
            body={
                <BaseView alignItems="center" justifyContent="space-between">
                    <BaseView flexDirection="row">
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

                    <BaseView alignItems="center" w={100}>
                        <VeWorldLogoSVG height={200} width={200} />
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
                    <BaseText typographyFont="caption" py={10}>
                        {LL.BD_GDPR()}
                    </BaseText>

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
