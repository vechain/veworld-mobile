import React, { useCallback, useEffect, useMemo } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
// import { Routes } from "~Navigation"
import VectorImage from "react-native-vector-image"
import { VeChainVetLogo } from "~Assets"
import { useI18nContext } from "~i18n"
import { Fonts } from "~Model"
import { Device, useStoreQuery } from "~Storage"
import {
    useCreateWalletWithBiometrics,
    useCreateWalletWithPassword,
    useWalletSecurity,
} from "~Common"

export const WalletSuccessScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { isWalletSecurityBiometrics } = useWalletSecurity()

    const { onCreateWallet, isComplete } = useCreateWalletWithBiometrics()
    const {
        onCreateWallet: createWalletWithPassword,
        isComplete: isWalletCreatedWithPassword,
    } = useCreateWalletWithPassword()

    // todo: this is a workaround until the new version is installed
    const result1 = useStoreQuery(Device)
    const devices = useMemo(() => result1.sorted("rootAddress"), [result1])

    const onButtonPress = useCallback(() => {
        if (devices.length) {
            if (isWalletSecurityBiometrics) {
                onCreateWallet()
            } else {
                //todo: get pin from user
                createWalletWithPassword("000000")
            }
        } else {
            // set isWalletCreated = true here if you're on the onbarding flow
        }
    }, [
        createWalletWithPassword,
        devices.length,
        isWalletSecurityBiometrics,
        onCreateWallet,
    ])

    useEffect(() => {
        if (isComplete || isWalletCreatedWithPassword) {
            //todo : navigate with popToTop in order to close the modal
            //todo:  first go to parent nav and from there close modal
        }
    }, [isComplete, isWalletCreatedWithPassword, nav])

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
