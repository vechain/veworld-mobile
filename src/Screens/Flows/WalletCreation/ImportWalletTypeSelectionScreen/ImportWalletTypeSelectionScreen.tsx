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
import { useI18nContext } from "~i18n"

export const ImportWalletTypeSelectionScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const onImportWithMnemonic = () => {
        nav.navigate(Routes.IMPORT_MNEMONIC)
    }

    const onImportWithHardware = () => {}

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="space-between" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText typographyFont="title">
                        {LL.TITLE_IMPORT_WALLET_TYPE()}
                    </BaseText>

                    <BaseText typographyFont="body" my={10}>
                        {LL.BD_IMPORT_WALLET_TYPE()}
                    </BaseText>
                </BaseView>

                <BaseView w={100}>
                    <BaseText typographyFont="subTitle" my={10}>
                        {LL.SB_IMPORT_WALLET_TYPE_SEED()}
                    </BaseText>
                    <BaseText typographyFont="body">
                        {LL.BD_IMPORT_WALLET_TYPE_SEED()}
                    </BaseText>
                    <BaseButton
                        action={onImportWithMnemonic}
                        w={100}
                        my={20}
                        title={LL.BTN_CREATE_WALLET_TYPE_IMPORT()}
                    />

                    <BaseSpacer height={20} />

                    <BaseText typographyFont="subTitle" my={10}>
                        {LL.SB_IMPORT_WALLET_TYPE_HARDWARE()}
                    </BaseText>
                    <BaseText typographyFont="body">
                        {LL.BD_IMPORT_WALLET_TYPE_HARDWARE()}
                    </BaseText>

                    <BaseSpacer height={20} />
                    <BaseButton
                        variant="outline"
                        action={onImportWithHardware}
                        w={100}
                        title={LL.BTN_CREATE_WALLET_TYPE_IMPORT()}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
