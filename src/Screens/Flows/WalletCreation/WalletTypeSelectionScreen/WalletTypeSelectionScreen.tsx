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
import { useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { selectHasOnboarded } from "~Storage/Redux/Selectors"

export const WalletTypeSelectionScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const userHasOnboarded = useAppSelector(selectHasOnboarded)

    const navigateToNewWallet = () => {
        if (userHasOnboarded) {
            nav.navigate(Routes.NEW_MNEMONIC)
        } else {
            nav.navigate(Routes.WALLET_TUTORIAL)
        }
    }

    const navigateToImportWallet = () => {
        nav.navigate(Routes.WALLET_TYPE_IMPORT)
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView
                alignItems="center"
                justifyContent="space-between"
                flexGrow={1}
                mx={20}>
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="title">
                        {LL.TITLE_CREATE_WALLET_TYPE()}
                    </BaseText>
                    {/* TODO: change this lorem ipsum */}
                    {/* eslint-disable-next-line i18next/no-literal-string */}
                    <BaseText typographyFont="body" my={10}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </BaseText>
                </BaseView>

                <BaseView alignItems="center" w={100}>
                    <BaseButton
                        action={navigateToNewWallet}
                        w={100}
                        mx={20}
                        my={20}
                        title={LL.BTN_CREATE_WALLET_TYPE_CREATE_NEW()}
                    />

                    <BaseButton
                        variant="outline"
                        action={navigateToImportWallet}
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
