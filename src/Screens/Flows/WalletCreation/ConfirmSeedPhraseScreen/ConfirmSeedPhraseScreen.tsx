import { useNavigation } from "@react-navigation/native"
import React, { useMemo } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { Fonts } from "~Model"
import { Routes } from "~Navigation"
import { Config, useStoreQuery } from "~Storage"

export const ConfirmSeedPhraseScreen = () => {
    const nav = useNavigation()

    // todo: this is a workaround until the new version is installed
    const result2 = useStoreQuery(Config)
    const config = useMemo(() => result2.sorted("_id"), [result2])

    const onConfirmPress = () => {
        if (config[0]?.isWalletCreated) {
            nav.navigate(Routes.WALLET_SUCCESS)
        } else {
            nav.navigate(Routes.APP_SECURITY)
        }
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseView align="center" justify="space-between" grow={1} mx={20}>
                <BaseText font={Fonts.body} my={10}>
                    Confirm Mnemonic
                </BaseText>

                <BaseButton
                    filled
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
