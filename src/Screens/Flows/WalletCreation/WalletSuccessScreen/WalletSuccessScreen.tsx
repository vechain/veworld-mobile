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
import { SecurityLevelType, WALLET_STATUS } from "~Model"
import { getAppLock, getConfig, useRealm } from "~Storage"
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

type Props = {} & NativeStackScreenProps<
    RootStackParamListOnboarding & RootStackParamListCreateWalletApp,
    Routes.WALLET_SUCCESS
>

export const WalletSuccessScreen: FC<Props> = ({ route }) => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const { store, cache } = useRealm()
    const theme = useTheme()
    const [isError, setIsError] = useState("")

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

        const config = getConfig(store)

        if (config?.isWalletCreated) {
            if (config.userSelectedSecurity === SecurityLevelType.BIOMETRIC) {
                let { success } =
                    await BiometricsUtils.authenticateWithBiometric()
                if (success) {
                    createWalletWithBiometrics(onWalletCreationError)
                }
            } else {
                openPasswordPrompt()
            }
        } else {
            if (params?.securityLevelSelected === SecurityLevelType.BIOMETRIC) {
                createWalletWithBiometrics()
            } else if (
                params?.securityLevelSelected === SecurityLevelType.SECRET
            ) {
                createWalletWithPassword(
                    params?.userPin!,
                    onWalletCreationError,
                )
            }
        }
    }, [
        route.params,
        store,
        createWalletWithBiometrics,
        openPasswordPrompt,
        createWalletWithPassword,
        onWalletCreationError,
    ])

    const onPasswordSuccess = useCallback(
        (password: string) =>
            createWalletWithPassword(password, onWalletCreationError),
        [createWalletWithPassword, onWalletCreationError],
    )

    useEffect(() => {
        if (isWalletCreatedWithBiometrics || isWalletCreatedWithPassword) {
            const config = getConfig(store)

            if (config?.isWalletCreated) {
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

                store.write(() => {
                    if (config) {
                        config.isWalletCreated = true
                    }
                })
            }
        }
    }, [
        cache,
        closePasswordPrompt,
        isPasswordPromptOpen,
        isWalletCreatedWithBiometrics,
        isWalletCreatedWithPassword,
        nav,
        store,
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
