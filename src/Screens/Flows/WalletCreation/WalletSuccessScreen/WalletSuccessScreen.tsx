import React, { FC, useCallback, useEffect, useState } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { VeChainVetLogoSVG } from "~Assets"
import { useI18nContext } from "~i18n"
import { SecurityLevelType } from "~Model"
import { useCheckIdentity, useCreateWallet, useTheme } from "~Common"
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
import { selectMnemonic, selectHasOnboarded } from "~Storage/Redux/Selectors"

type Props = {} & NativeStackScreenProps<
    RootStackParamListOnboarding & RootStackParamListCreateWalletApp,
    Routes.WALLET_SUCCESS
>

export const WalletSuccessScreen: FC<Props> = ({ route }) => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const theme = useTheme()
    const [isError] = useState("")

    const dispatch = useAppDispatch()

    //we have a device and a selected account
    const userHasOnboarded = useAppSelector(selectHasOnboarded)

    const mnemonic = useAppSelector(selectMnemonic)

    const { onCreateWallet: createWallet, isComplete: isWalletCreated } =
        useCreateWallet()

    const onIdentityConfirmed = useCallback(
        async (userPassword?: string) => {
            if (!mnemonic) throw new Error("Mnemonic is not available")

            await createWallet({
                mnemonic,
                userPassword,
                // onError: onWalletCreationError,
            })
        },
        [mnemonic, createWallet],
    )

    const {
        ConfirmIdentityBottomSheet,
        isPasswordPromptOpen,
        closePasswordPrompt,
        checkIdentityBeforeOpening,
    } = useCheckIdentity({ onIdentityConfirmed })

    // function onWalletCreationError(_error: unknown) {
    //     setIsError("Error creating wallet")
    //     closePasswordPrompt()
    // }

    /**
     * On first onboarding, create the wallet and set the security type selected by the user (biometric or secret)
     */
    const onboardingCreateWallet = useCallback(async () => {
        let params = route.params

        if (userHasOnboarded) return

        if (!mnemonic) throw new Error("Mnemonic is not available")

        if (!params?.securityLevelSelected)
            throw new Error("Security level is not available")

        const securityLevelSelected = params.securityLevelSelected

        if (securityLevelSelected === SecurityLevelType.BIOMETRIC) {
            await createWallet({ mnemonic })
            setUserSelectedSecurity(SecurityLevelType.BIOMETRIC)
        } else if (securityLevelSelected === SecurityLevelType.SECRET) {
            await createWallet({
                userPassword: params?.userPin,
                // onError: onWalletCreationError,
                mnemonic,
            })
            dispatch(setUserSelectedSecurity(SecurityLevelType.SECRET))
        }
    }, [userHasOnboarded, route.params, createWallet, dispatch, mnemonic])

    const onButtonPress = useCallback(async () => {
        if (!mnemonic) throw new Error("Mnemonic is not available")

        if (userHasOnboarded) {
            await checkIdentityBeforeOpening()
        } else await onboardingCreateWallet()
    }, [
        checkIdentityBeforeOpening,
        onboardingCreateWallet,
        userHasOnboarded,
        mnemonic,
    ])

    useEffect(() => {
        if (isWalletCreated) {
            if (userHasOnboarded) {
                closePasswordPrompt()

                if (!isPasswordPromptOpen) {
                    /*
                    Navigate to parent stack (where the CreateWalletAppStack is declared)
                    and close the modal.
                    */
                    let parent = nav.getParent()
                    if (parent) {
                        let isBack = parent.canGoBack()
                        if (isBack) {
                            parent.goBack()
                        }
                    }
                }
            }
        }
    }, [
        closePasswordPrompt,
        dispatch,
        isPasswordPromptOpen,
        userHasOnboarded,
        isWalletCreated,
        nav,
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
                            <VeChainVetLogoSVG />
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
                                haptics="medium"
                            />
                        </BaseView>
                    </BaseView>

                    <BaseSpacer height={40} />
                </BaseView>
            </BaseSafeArea>
        </>
    )
}
