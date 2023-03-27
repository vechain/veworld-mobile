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
import {
    SecurityLevelType,
    UserSelectedSecurityLevel,
    WALLET_STATUS,
} from "~Model"
import { getAppLock, useRealm } from "~Storage"
import {
    BiometricsUtils,
    useCreateWalletWithBiometrics,
    useCreateWalletWithPassword,
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
    getMnemonic,
    hasOnboarded,
    selectUserSelectedSecurity,
} from "~Storage/Redux/Selectors"

type Props = {} & NativeStackScreenProps<
    RootStackParamListOnboarding & RootStackParamListCreateWalletApp,
    Routes.WALLET_SUCCESS
>

export const WalletSuccessScreen: FC<Props> = ({ route }) => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const { cache } = useRealm()
    const theme = useTheme()
    const [isError, setIsError] = useState("")

    const dispatch = useAppDispatch()

    //we have a device and a selected account
    const userHasOnboarded = useAppSelector(hasOnboarded)
    const userSelectedSecurity = useAppSelector(selectUserSelectedSecurity)

    const mnemonic = useAppSelector(getMnemonic).value

    console.log({ mnemonic })

    const {
        onCreateWallet: createWalletWithBiometrics,
        isComplete: isWalletCreatedWithBiometrics,
    } = useCreateWalletWithBiometrics()
    const {
        onCreateWallet: createWalletWithPassword,
        isComplete: isWalletCreatedWithPassword,
    } = useCreateWalletWithPassword()

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
            if (userSelectedSecurity === UserSelectedSecurityLevel.BIOMETRIC) {
                let { success } =
                    await BiometricsUtils.authenticateWithBiometric()
                if (success) {
                    createWalletWithBiometrics({
                        mnemonic,
                        onError: onWalletCreationError,
                    })
                }
            } else {
                openPasswordPrompt()
            }
        } else {
            if (params?.securityLevelSelected === SecurityLevelType.BIOMETRIC) {
                createWalletWithBiometrics({ mnemonic })
            } else if (
                params?.securityLevelSelected === SecurityLevelType.SECRET
            ) {
                createWalletWithPassword({
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
        createWalletWithBiometrics,
        onWalletCreationError,
        openPasswordPrompt,
        createWalletWithPassword,
        mnemonic,
    ])

    const onPasswordSuccess = useCallback(
        (password: string) => {
            if (!mnemonic) throw new Error("Mnemonic is not available")

            createWalletWithPassword({
                userPassword: password,
                mnemonic,
                onError: onWalletCreationError,
            })
        },
        [createWalletWithPassword, onWalletCreationError, mnemonic],
    )

    useEffect(() => {
        if (isWalletCreatedWithBiometrics || isWalletCreatedWithPassword) {
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
            } else {
                let appLock = getAppLock(cache)
                cache.write(() => {
                    if (appLock) {
                        appLock.status = WALLET_STATUS.UNLOCKED
                    }
                })
            }
        }
    }, [
        cache,
        closePasswordPrompt,
        dispatch,
        isPasswordPromptOpen,
        userHasOnboarded,
        isWalletCreatedWithBiometrics,
        isWalletCreatedWithPassword,
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
