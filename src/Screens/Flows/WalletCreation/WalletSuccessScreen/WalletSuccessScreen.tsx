import React, { FC, useCallback, useState } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    showErrorToast,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { VeWorldLogoSVG } from "~Assets"
import { useI18nContext } from "~i18n"
import { SecurityLevelType } from "~Model"
import { useCheckIdentity, useCreateWallet, useTheme } from "~Hooks"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    RootStackParamListCreateWalletApp,
    RootStackParamListOnboarding,
    Routes,
} from "~Navigation"
import {
    setUserSelectedSecurity,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    selectMnemonic,
    selectHasOnboarded,
    selectNewLedgerDevice,
} from "~Storage/Redux/Selectors"
import HapticsService from "~Services/HapticsService"

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

    const mnemonic = useAppSelector(selectMnemonic)
    const newLedger = useAppSelector(selectNewLedgerDevice)

    const {
        onCreateWallet: createWallet,
        onCreateLedgerWallet: createLedgerWallet,
    } = useCreateWallet()

    const onWalletCreationError = useCallback((_error: unknown) => {
        HapticsService.triggerNotification({ level: "Error" })
        setIsError("Error creating wallet")
        showErrorToast("Error creating wallet")
    }, [])

    const navigateNext = useCallback(() => {
        const parent = nav.getParent()
        if (parent) {
            if (parent.canGoBack()) {
                parent.goBack()
            }
        }
    }, [nav])

    // TODO (Erik) (https://github.com/vechainfoundation/veworld-mobile/issues/772) do not authenticate user if ledger ?
    const onIdentityConfirmed = useCallback(
        async (userPassword?: string) => {
            if (!mnemonic && !newLedger)
                throw new Error(
                    "Wrong/corrupted data. No device available in store",
                )

            if (mnemonic) {
                await createWallet({
                    mnemonic,
                    userPassword,
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
        },
        [
            mnemonic,
            createWallet,
            onWalletCreationError,
            navigateNext,
            newLedger,
            createLedgerWallet,
        ],
    )

    const {
        ConfirmIdentityBottomSheet,
        checkIdentityBeforeOpening,
        isBiometricsEmpty,
    } = useCheckIdentity({ onIdentityConfirmed })
    /**
     * On first onboarding, create the wallet and set the security type selected by the user (biometric or secret)
     */
    const onboardingCreateWallet = useCallback(async () => {
        let params = route.params

        if (userHasOnboarded) return

        if (!mnemonic && !newLedger)
            throw new Error(
                "Wrong/corrupted data. No device available in store",
            )

        if (!params?.securityLevelSelected)
            throw new Error("Security level is not available")

        const securityLevelSelected = params.securityLevelSelected
        if (mnemonic) {
            if (securityLevelSelected === SecurityLevelType.BIOMETRIC) {
                await createWallet({ mnemonic })
            } else if (securityLevelSelected === SecurityLevelType.SECRET) {
                await createWallet({
                    userPassword: params?.userPin,
                    onError: onWalletCreationError,
                    mnemonic,
                })
            } else {
                throw new Error(
                    `Security level ${securityLevelSelected} is not valid`,
                )
            }
        }

        if (newLedger) {
            await createLedgerWallet({
                newLedger,
                onError: onWalletCreationError,
            })
        }

        dispatch(setUserSelectedSecurity(securityLevelSelected))
    }, [
        newLedger,
        mnemonic,
        userHasOnboarded,
        route.params,
        createWallet,
        createLedgerWallet,
        dispatch,
        onWalletCreationError,
    ])

    const onButtonPress = useCallback(async () => {
        if (!mnemonic && !newLedger)
            throw new Error(
                "Wrong/corrupted data. No device available in store",
            )

        if (userHasOnboarded) {
            await checkIdentityBeforeOpening()
        } else await onboardingCreateWallet()
    }, [
        checkIdentityBeforeOpening,
        onboardingCreateWallet,
        userHasOnboarded,
        mnemonic,
        newLedger,
    ])

    return (
        <>
            <ConfirmIdentityBottomSheet />
            <BaseSafeArea grow={1}>
                <BaseSpacer height={20} />

                <BaseView alignItems="center" mx={20} flexGrow={1}>
                    <BaseView flexDirection="row" flexWrap="wrap">
                        <BaseText typographyFont="title">
                            {LL.TITLE_WALLET_SUCCESS()}
                        </BaseText>
                    </BaseView>

                    <BaseSpacer height={120} />

                    <BaseView
                        alignItems="center"
                        justifyContent="space-between"
                        w={100}
                        flexGrow={1}>
                        <BaseView alignItems="center">
                            <VeWorldLogoSVG height={200} width={200} />
                            <BaseText align="center" py={20}>
                                {LL.BD_WALLET_SUCCESS()}
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
                                title={LL.BTN_WALLET_SUCCESS()}
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
