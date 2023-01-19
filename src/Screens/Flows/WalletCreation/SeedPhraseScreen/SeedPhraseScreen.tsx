import React, { useCallback, useEffect, useState } from "react"
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
import { SeedUtils } from "~Common"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

export const SeedPhraseScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const [mnemonic, setMnemonic] = useState("")
    const [mnemonicArray, _setMnemonicArray] = useState<string[]>(
        Array.from({ length: 12 }),
    )

    const [IsChecked, setIsChecked] = useState(false)

    const onCopyToClipboard = useCallback(async () => {
        await Clipboard.setStringAsync(mnemonic)
        Alert.alert("Copied to clipboard")
    }, [mnemonic])

    // todo.vas -> remove once wallet service is up
    useEffect(() => {
        let text =
            "cactus quit copper cluster refuse palace faith kid atom reward draft decade"

        let seed = SeedUtils.sanifySeed(text)

        if (seed.length === 12) {
            setMnemonic(text)
            _setMnemonicArray(seed)
        }
    }, [])

    const onBackupPress = useCallback(() => {
        nav.navigate(Routes.CONFIRM_SEED_PHRASE)
    }, [nav])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="space-between" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText font="large_title" align="left">
                        {LL.TITLE_MNEMONIC()}
                    </BaseText>

                    <BaseText font="body" my={10}>
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

                    <BaseText font="footnote_accent" color="red" my={10}>
                        {LL.BD_MNEMONIC_DISCLAIMER()}
                    </BaseText>

                    <BaseText font="footnote">
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
