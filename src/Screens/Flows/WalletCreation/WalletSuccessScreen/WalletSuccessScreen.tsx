import React, { useCallback, useEffect, useMemo } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import VectorImage from "react-native-vector-image"
import { VeChainVetLogo } from "~Assets"
import { useI18nContext } from "~i18n"
import { Fonts, WALLET_STATUS } from "~Model"
import {
    AppLock,
    Config,
    Device,
    RealmClass,
    useCache,
    useStore,
    useStoreQuery,
} from "~Storage"
import {
    useCreateWalletWithBiometrics,
    useCreateWalletWithPassword,
    useWalletSecurity,
} from "~Common"

export const WalletSuccessScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { isWalletSecurityBiometrics } = useWalletSecurity()

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

    // todo: this is a workaround until the new version is installed
    const result1 = useStoreQuery(Device)
    const devices = useMemo(() => result1.sorted("rootAddress"), [result1])

    // todo: this is a workaround until the new version is installed, then use the above
    const result2 = useStoreQuery(Config)
    const config = useMemo(() => result2.sorted("_id"), [result2])

    const isMultipleWallets = useMemo(
        () => devices.length && config[0].isWalletCreated,
        [config, devices.length],
    )

    const onButtonPress = useCallback(() => {
        if (isMultipleWallets) {
            if (isWalletSecurityBiometrics) {
                createWalletWithBiometrics()
            } else {
                //todo: get pin from user
                createWalletWithPassword("000000")
            }
        } else {
            cache.write(() => {
                let appLock = cache.objectForPrimaryKey<AppLock>(
                    RealmClass.AppLock,
                    "APP_LOCK",
                )
                if (appLock) {
                    appLock.status = WALLET_STATUS.UNLOCKED
                }
            })
            store.write(() => {
                config[0].isWalletCreated = true
            })
        }
    }, [
        isMultipleWallets,
        isWalletSecurityBiometrics,
        createWalletWithBiometrics,
        createWalletWithPassword,
        cache,
        store,
        config,
    ])

    /*
        We arrive in this hook only when we're coming from "create additional wallet flow"
    */
    useEffect(() => {
        if (isWalletCreatedWithBiometrics || isWalletCreatedWithPassword) {
            /*
                Navigate to parent stack (where the CreateWalletAppStack is declared)
                and close the modal.
            */
            nav.getParent()?.goBack()
        }
    }, [isWalletCreatedWithBiometrics, isWalletCreatedWithPassword, nav])

    return (
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
    )
}
