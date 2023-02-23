import { useNavigation } from "@react-navigation/native"
import React from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { Fonts } from "~Model"
import { Routes } from "~Navigation"
import { Config, useStoreObject } from "~Storage"
import { useI18nContext } from "~i18n"

export const WalletTypeSelectionScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const config = useStoreObject<Config>(Config.getName(), Config.PrimaryKey())

    const onCreateWallet = () => {
        if (config?.isWalletCreated) {
            nav.navigate(Routes.SEED_PHRASE)
        } else {
            nav.navigate(Routes.WALLET_TUTORIAL)
        }
    }

    const onImportWallet = () => {
        nav.navigate(Routes.WALLET_TYPE_IMPORT)
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="space-between" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText font={Fonts.large_title}>
                        {LL.TITLE_CREATE_WALLET_TYPE()}
                    </BaseText>

                    <BaseText font={Fonts.body} my={10}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </BaseText>
                </BaseView>

                <BaseView align="center" w={100}>
                    <BaseButton
                        filled
                        action={onCreateWallet}
                        w={100}
                        mx={20}
                        my={20}
                        title={LL.BTN_CREATE_WALLET_TYPE_CREATE_NEW()}
                    />

                    <BaseButton
                        bordered
                        action={onImportWallet}
                        w={100}
                        mx={20}
                        title={LL.BTN_CREATE_WALLET_TYPE_IMPORT()}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
