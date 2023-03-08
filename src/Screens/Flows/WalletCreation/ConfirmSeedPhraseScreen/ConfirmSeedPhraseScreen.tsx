import { useNavigation } from "@react-navigation/native"
import React from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { Routes } from "~Navigation"
import { Config, useRealm } from "~Storage"

export const ConfirmSeedPhraseScreen = () => {
    const nav = useNavigation()
    const { store } = useRealm()

    const config = store.objectForPrimaryKey<Config>(
        Config.getName(),
        Config.getPrimaryKey(),
    )

    const onConfirmPress = () => {
        if (config?.isWalletCreated) {
            nav.navigate(Routes.WALLET_SUCCESS)
        } else {
            nav.navigate(Routes.APP_SECURITY)
        }
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseView justify="space-between" grow={1} mx={20}>
                <BaseText typographyFont="title" my={10}>
                    Confirm Mnemonic
                </BaseText>

                <BaseButton
                    action={onConfirmPress}
                    w={100}
                    px={20}
                    title={"Confirm"}
                    disabled={false}
                />
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
