import React, { useCallback, useEffect } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { VeChainVetLogoSVG } from "~Assets"
import { useI18nContext } from "~i18n"
import {
    addDeviceAndAccounts,
    fetchTokensWithInfo,
    selectAccount,
    setAppLockStatus,
    setMnemonic,
    setPinValidationString,
    useAppDispatch,
} from "~Storage/Redux"
import { CryptoUtils, PasswordUtils, SeedUtils } from "~Utils"
import { SettingsConstants, useDeviceUtils } from "~Common"
import { WALLET_STATUS } from "~Model"

export const WelcomeScreen = () => {
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const onNavigate = useCallback(() => {
        nav.navigate(Routes.WALLET_SETUP)
    }, [nav])

    /*
     * Fetch tokens with info on app start
     * We want to pre-fetch the tokens with info on app start to get better UX when there are no persisted tokens
     */
    useEffect(() => {
        dispatch(fetchTokensWithInfo())
    }, [dispatch])

    /**
     * onboarding with the demo account and password 111111 for TDD purposes
     */
    const { getDeviceFromMnemonic } = useDeviceUtils()
    const onDemoOnboarding = async () => {
        const DEMO_MNEMONIC =
            "denial kitchen pet squirrel other broom bar gas better priority spoil cross"
        const FAKE_PIN = "111111"
        const sanitisedMnemonic = SeedUtils.sanifySeed(DEMO_MNEMONIC).join(" ")
        dispatch(setMnemonic(sanitisedMnemonic))
        const pinValidationString = CryptoUtils.encrypt<string>(
            SettingsConstants.VALIDATION_STRING,
            FAKE_PIN,
        )
        dispatch(setPinValidationString(pinValidationString))
        const { device, wallet } = getDeviceFromMnemonic(DEMO_MNEMONIC)
        dispatch(setMnemonic(undefined))

        const { encryptedWallet } = await CryptoUtils.encryptWallet({
            wallet,
            rootAddress: device.rootAddress,
            accessControl: false,
            hashEncryptionKey: PasswordUtils.hash(FAKE_PIN),
        })

        const newAccount = dispatch(
            addDeviceAndAccounts({
                ...device,
                wallet: encryptedWallet,
            }),
        )

        dispatch(setAppLockStatus(WALLET_STATUS.UNLOCKED))
        dispatch(selectAccount({ address: newAccount.address }))
        const parent = nav.getParent()
        if (parent) {
            if (parent.canGoBack()) {
                parent.goBack()
            }
        }
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />

            <BaseView alignItems="center" mx={20} flexGrow={1}>
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

                <BaseSpacer height={80} />

                <BaseView alignItems="center" w={100} flexGrow={1}>
                    <VeChainVetLogoSVG />
                    <BaseSpacer height={40} />
                    <BaseText
                        align="left"
                        typographyFont="buttonPrimary"
                        py={20}>
                        {LL.BD_WELCOME_SCREEN()}
                    </BaseText>
                </BaseView>

                <BaseView alignItems="center" w={100}>
                    <BaseText typographyFont="caption" py={10}>
                        {LL.BD_GDPR()}
                    </BaseText>

                    <BaseButton
                        action={onNavigate}
                        w={100}
                        title={LL.BTN_GET_STARTED()}
                        testID="GET_STARTED_BTN"
                        haptics="medium"
                    />
                </BaseView>
                {__DEV__ && (
                    <BaseButton
                        size="md"
                        variant="link"
                        action={onDemoOnboarding}
                        title="DEV:DEMO"
                    />
                )}
                <BaseSpacer height={40} />
            </BaseView>
        </BaseSafeArea>
    )
}
