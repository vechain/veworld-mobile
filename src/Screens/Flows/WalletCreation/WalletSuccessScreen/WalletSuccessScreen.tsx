import React, { FC, useCallback, useEffect, useState } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    RequireUserPassword,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { VeChainVetLogoSVG } from "~Assets"
import { useI18nContext } from "~i18n"
import { SecurityLevelType } from "~Model"
import {
    BiometricsUtils,
    useCreateWallet,
    useDisclosure,
    useTheme,
} from "~Common"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    RootStackParamListCreateWalletApp,
    RootStackParamListOnboarding,
    Routes,
} from "~Navigation"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    selectMnemonic,
    selectHasOnboarded,
    selectUserSelectedSecurity,
} from "~Storage/Redux/Selectors"

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
    const userSelectedSecurity = useAppSelector(selectUserSelectedSecurity)

    const mnemonic = useAppSelector(selectMnemonic)

    const { onCreateWallet: createWallet, isComplete: isWalletCreated } =
        useCreateWallet()

    const {
        isOpen: isPasswordPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closePasswordPrompt,
    } = useDisclosure()

    const onWalletCreationError = useCallback(
        (_error: unknown) => {
            setIsError("Error creating wallet")
            closePasswordPrompt()
        },
        [setIsError, closePasswordPrompt],
    )

    const onButtonPress = useCallback(async () => {
        let params = route.params

        if (!mnemonic) throw new Error("Mnemonic is not available")

        if (userHasOnboarded) {
            if (userSelectedSecurity === SecurityLevelType.BIOMETRIC) {
                // todo.vas -> replace with authenticateWithBiometrics new hook?
                let { success } =
                    await BiometricsUtils.authenticateWithBiometrics()
                if (success) {
                    await createWallet({
                        mnemonic,
                        onError: onWalletCreationError,
                    })
                }
            } else {
                return openPasswordPrompt()
            }
        } else {
            if (params?.securityLevelSelected === SecurityLevelType.BIOMETRIC) {
                await createWallet({ mnemonic })
            } else if (
                params?.securityLevelSelected === SecurityLevelType.SECRET
            ) {
                await createWallet({
                    userPassword: params?.userPin!,
                    onError: onWalletCreationError,
                    mnemonic,
                })
            }
        }
    }, [
        route.params,
        userHasOnboarded,
        userSelectedSecurity,
        createWallet,
        onWalletCreationError,
        openPasswordPrompt,
        mnemonic,
    ])

    const onPasswordSuccess = useCallback(
        async (password: string) => {
            if (!mnemonic) throw new Error("Mnemonic is not available")

            await createWallet({
                userPassword: password,
                mnemonic,
                onError: onWalletCreationError,
            })
        },
        [createWallet, onWalletCreationError, mnemonic],
    )

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
            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={closePasswordPrompt}
                onSuccess={onPasswordSuccess}
            />

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
