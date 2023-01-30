import React, { useCallback, useState } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CheckBoxWithText,
    MnemonicCard,
} from "~Components"
import { Alert } from "react-native"
import * as Clipboard from "expo-clipboard"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { Fonts } from "~Model"
import { useGenerateMnemonic } from "./useGenerateMnemonic"
import { useCache } from "~Storage"

export const SeedPhraseScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const cache = useCache()

    const [IsChecked, setIsChecked] = useState(false)
    const { mnemonic, mnemonicArray } = useGenerateMnemonic()

    const onCopyToClipboard = useCallback(async () => {
        await Clipboard.setStringAsync(mnemonic)
        Alert.alert("Success!", "Mnemonic copied to clipboard")
    }, [mnemonic])

    const onBackupPress = useCallback(() => {
        cache.write(() => cache.create("Mnemonic", { mnemonic }))
        nav.navigate(Routes.CONFIRM_SEED_PHRASE)
    }, [cache, mnemonic, nav])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="space-between" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText font={Fonts.large_title} align="left">
                        {LL.TITLE_MNEMONIC()}
                    </BaseText>

                    <BaseText font={Fonts.body} my={10}>
                        {LL.BD_MNEMONIC_SUBTITLE()}
                    </BaseText>

                    <BaseSpacer height={60} />

                    <BaseButton
                        selfAlign="flex-end"
                        action={onCopyToClipboard}
                        w={100}
                        title={LL.BTN_MNEMONIC_CLIPBOARD()}
                        disabled={!mnemonic}
                    />

                    <MnemonicCard mnemonicArray={mnemonicArray} />

                    <BaseText font={Fonts.footnote_accent} color="red" my={10}>
                        {LL.BD_MNEMONIC_DISCLAIMER()}
                    </BaseText>

                    <BaseText font={Fonts.footnote}>
                        {LL.BD_MNEMONIC_BACKUP()}
                    </BaseText>
                </BaseView>

                <BaseView align="center" w={100}>
                    <CheckBoxWithText
                        text={LL.BTN_MNEMONIC_CHECKBOX()}
                        checkAction={setIsChecked}
                    />

                    <BaseButton
                        filled
                        action={onBackupPress}
                        w={100}
                        px={20}
                        title={LL.BTN_MNEMONIC_BACKUP()}
                        disabled={!IsChecked}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
