import React, { FC, useCallback, useEffect, useState } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    RequireUserPassword,
    showErrorToast,
    useApplicationSecurity,
    WalletEncryptionKeyHelper,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { VeWorldLogoSVG } from "~Assets"
import { useI18nContext } from "~i18n"
import { SecurityLevelType } from "~Model"
import { useAnalyticTracking, useCheckIdentity, useCreateWallet, useTheme } from "~Hooks"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListCreateWalletApp, RootStackParamListOnboarding, Routes } from "~Navigation"
import { setDerivedPath, setIsAppLoading, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectHasOnboarded, selectMnemonic, selectNewLedgerDevice, selectPrivateKey } from "~Storage/Redux/Selectors"
import HapticsService from "~Services/HapticsService"
import { AnalyticsEvent, DerivationPath } from "~Constants"
import { BiometricsUtils } from "~Utils"

type Props = {} & NativeStackScreenProps<
    RootStackParamListOnboarding & RootStackParamListCreateWalletApp,
    Routes.WALLET_SUCCESS
>

export const WalletSuccessScreen: FC<Props> = ({ route }) => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const theme = useTheme()
    const [isError, setIsError] = useState("")

    const dispatch = useAppDispatch()

    //we have a device and a selected account
    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const track = useAnalyticTracking()

    const mnemonic = useAppSelector(selectMnemonic)
    const privateKey = useAppSelector(selectPrivateKey)
    const newLedger = useAppSelector(selectNewLedgerDevice)

    const { migrateOnboarding } = useApplicationSecurity()

    const { createLocalWallet, createLedgerWallet } = useCreateWallet()

    const onWalletCreationError = useCallback(
        (_error: unknown) => {
            if (BiometricsUtils.BiometricErrors.isBiometricCanceled(_error)) {
                return
            }

            if (BiometricsUtils.BiometricErrors.isBiometricTooManyAttempts(_error)) {
                HapticsService.triggerNotification({ level: "Error" })
                setIsError(LL.ERROR_TOO_MANY_BIOMETRICS_AUTH_ATTEMPTS())
                showErrorToast({
                    text1: LL.ERROR_TOO_MANY_BIOMETRICS_AUTH_ATTEMPTS(),
                })
                nav.reset({
                    index: 0,
                    routes: [{ name: Routes.WELCOME }],
                })
            } else {
                HapticsService.triggerNotification({ level: "Error" })
                setIsError(LL.ERROR_CREATING_WALLET())
                showErrorToast({ text1: LL.ERROR_CREATING_WALLET() })
            }
        },
        [LL, nav],
    )

    const navigateNext = useCallback(() => {
        const parent = nav.getParent()
        if (parent) {
            if (parent.canGoBack()) {
                parent.goBack()
            }
        }
    }, [nav])

    const onIdentityConfirmed = useCallback(
        async (userPassword?: string) => {
            if (!mnemonic && !privateKey && !newLedger)
                throw new Error("Wrong/corrupted data. No device available in store")

            if (mnemonic || privateKey) {
                await createLocalWallet({
                    mnemonic: mnemonic,
                    privateKey: privateKey,
                    userPassword: userPassword,
                    onError: onWalletCreationError,
                })
            }

            if (newLedger) {
                await createLedgerWallet({
                    newLedger,
                    onError: onWalletCreationError,
                })
            }

            navigateNext()
            dispatch(setDerivedPath(DerivationPath.VET))
        },
        [
            mnemonic,
            privateKey,
            newLedger,
            navigateNext,
            dispatch,
            createLocalWallet,
            onWalletCreationError,
            createLedgerWallet,
        ],
    )

    const {
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        checkIdentityBeforeOpening,
        isBiometricsEmpty,
    } = useCheckIdentity({ onIdentityConfirmed, allowAutoPassword: false })
    /**
     * On first onboarding, create the wallet and set the security type selected by the user (biometric or secret)
     */
    const onboardingCreateWallet = useCallback(async () => {
        try {
            let params = route.params

            if (userHasOnboarded) return

            if (!mnemonic && !privateKey && !newLedger)
                throw new Error("Wrong/corrupted data. No device available in store")

            if (!params?.securityLevelSelected) throw new Error("Security level is not available")

            dispatch(setIsAppLoading(true))

            if (newLedger) {
                await createLedgerWallet({
                    newLedger,
                    onError: onWalletCreationError,
                })
            }

            const securityLevelSelected = params.securityLevelSelected

            let pinCode = securityLevelSelected === SecurityLevelType.SECRET ? params?.userPin : undefined

            await WalletEncryptionKeyHelper.init(pinCode)

            if (mnemonic || privateKey) {
                if (securityLevelSelected === SecurityLevelType.BIOMETRIC) {
                    await createLocalWallet({
                        mnemonic: mnemonic,
                        privateKey: privateKey,
                        onError: onWalletCreationError,
                    })
                } else if (securityLevelSelected === SecurityLevelType.SECRET) {
                    await createLocalWallet({
                        mnemonic: mnemonic,
                        privateKey: privateKey,
                        userPassword: params?.userPin,
                        onError: onWalletCreationError,
                    })
                } else {
                    throw new Error(`Security level ${securityLevelSelected} is not valid`)
                }
            }

            if (securityLevelSelected === SecurityLevelType.BIOMETRIC) {
                await migrateOnboarding(securityLevelSelected)
            } else {
                await migrateOnboarding(securityLevelSelected, params.userPin)
            }
        } finally {
            dispatch(setDerivedPath(DerivationPath.VET))
            dispatch(setIsAppLoading(false))
        }
    }, [
        migrateOnboarding,
        newLedger,
        mnemonic,
        privateKey,
        userHasOnboarded,
        route.params,
        createLocalWallet,
        createLedgerWallet,
        dispatch,
        onWalletCreationError,
    ])

    const onButtonPress = useCallback(async () => {
        if (!mnemonic && !privateKey && !newLedger)
            throw new Error("Wrong/corrupted data. No device available in store")

        if (userHasOnboarded) {
            await checkIdentityBeforeOpening()
        } else await onboardingCreateWallet()
    }, [checkIdentityBeforeOpening, onboardingCreateWallet, userHasOnboarded, privateKey, mnemonic, newLedger])

    useEffect(() => {
        track(AnalyticsEvent.COMPLETED_WALLET_SCREEN)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={handleClosePasswordModal}
                onSuccess={onPasswordSuccess}
            />
            <BaseSafeArea grow={1}>
                <BaseSpacer height={20} />

                <BaseView alignItems="center" mx={20} flexGrow={1}>
                    <BaseView flexDirection="row" flexWrap="wrap">
                        <BaseText typographyFont="title">{LL.TITLE_CREATE_WALLET_SUCCESS()}</BaseText>
                    </BaseView>

                    <BaseSpacer height={120} />

                    <BaseView alignItems="center" justifyContent="space-between" w={100} flexGrow={1}>
                        <BaseView alignItems="center">
                            <VeWorldLogoSVG height={200} width={200} />
                            <BaseText align="center" py={20}>
                                {LL.BD_CREATE_WALLET_SUCCESS()}
                            </BaseText>
                        </BaseView>

                        <BaseView alignItems="center" w={100}>
                            {!!isError && (
                                <BaseText my={10} color={theme.colors.danger}>
                                    {isError}
                                </BaseText>
                            )}

                            <BaseButton
                                action={onButtonPress}
                                w={100}
                                title={LL.BTN_CREATE_WALLET_SUCCESS()}
                                testID="GET_STARTED_BTN"
                                haptics="Success"
                                isLoading={isBiometricsEmpty}
                                disabled={isBiometricsEmpty}
                            />
                        </BaseView>
                    </BaseView>
                    <BaseSpacer height={40} />
                </BaseView>
            </BaseSafeArea>
        </>
    )
}
