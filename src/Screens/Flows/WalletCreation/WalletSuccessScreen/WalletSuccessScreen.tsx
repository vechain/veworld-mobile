import React, { FC, useCallback, useEffect, useMemo } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    RequireUserPassword,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import VectorImage from "react-native-vector-image"
import { VeChainVetLogo } from "~Assets"
import { useI18nContext } from "~i18n"
import { Fonts, SecurityLevelType, WALLET_STATUS } from "~Model"
import { AppLock, Config, useCache, useStore, useStoreQuery } from "~Storage"
import {
    BiometricsUtils,
    useCreateWalletWithBiometrics,
    useCreateWalletWithPassword,
    useDisclosure,
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

    const cache = useCache()
    const store = useStore()

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

    // todo: this is a workaround until the new version is installed
    const result2 = useStoreQuery(Config)
    const config = useMemo(() => result2.sorted("_id"), [result2])

    const onButtonPress = useCallback(async () => {
        let params = route.params

        if (config[0]?.isWalletCreated) {
            if (
                config[0].userSelectedSecurtiy === SecurityLevelType.BIOMETRIC
            ) {
                let { success } =
                    await BiometricsUtils.authenticateWithBiometric()
                if (success) {
                    createWalletWithBiometrics()
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
                createWalletWithPassword(params?.userPin!)
            }
        }
    }, [
        route.params,
        config,
        createWalletWithBiometrics,
        openPasswordPrompt,
        createWalletWithPassword,
    ])

    const onPasswordSuccess = useCallback(
        (password: string) => createWalletWithPassword(password),
        [createWalletWithPassword],
    )

    useEffect(() => {
        if (isWalletCreatedWithBiometrics || isWalletCreatedWithPassword) {
            if (config[0]?.isWalletCreated) {
                closePasswordPrompt()

                setTimeout(() => {
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
                }, 500)
            } else {
                cache.write(() => {
                    let appLock = cache.objectForPrimaryKey<AppLock>(
                        AppLock.getName(),
                        AppLock.PrimaryKey(),
                    )
                    if (appLock) {
                        appLock.status = WALLET_STATUS.UNLOCKED
                    }
                })
                store.write(() => {
                    config[0].isWalletCreated = true
                })
            }
        }
    }, [
        cache,
        closePasswordPrompt,
        config,
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

                <BaseView align="center" mx={20} grow={1}>
                    <BaseView orientation="row" wrap>
                        <BaseText font={Fonts.title}>
                            {LL.TITLE_WALLET_SUCCESS()}
                        </BaseText>
                    </BaseView>

                    <BaseSpacer height={120} />

                    <BaseView
                        align="center"
                        justify="space-between"
                        w={100}
                        grow={1}>
                        <BaseView align="center">
                            <VectorImage source={VeChainVetLogo} />
                            <BaseText align="center" py={20}>
                                {LL.BD_WALLET_SUCCESS()}
                            </BaseText>
                        </BaseView>

                        <BaseView align="center" w={100}>
                            <BaseButton
                                filled
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
