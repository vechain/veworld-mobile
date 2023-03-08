import React, { useCallback, useState } from "react"
import {
    BaseButton,
    BaseIcon,
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
import { useGenerateMnemonic } from "./useGenerateMnemonic"
import { Mnemonic, useRealm } from "~Storage"
import { useTheme } from "~Common"

export const SeedPhraseScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { cache } = useRealm()

    const [IsChecked, setIsChecked] = useState(false)
    const { mnemonic, mnemonicArray } = useGenerateMnemonic()

    const theme = useTheme()

    const onCopyToClipboard = useCallback(async () => {
        await Clipboard.setStringAsync(mnemonic)
        Alert.alert("Success!", "Mnemonic copied to clipboard")
    }, [mnemonic])

    const onBackupPress = useCallback(() => {
        cache.write(() => {
            let _mnemonic = cache.objectForPrimaryKey<Mnemonic>(
                Mnemonic.getName(),
                Mnemonic.getPrimaryKey(),
            )

            if (_mnemonic) {
                _mnemonic.mnemonic = mnemonic
            }
        })
        nav.navigate(Routes.CONFIRM_SEED_PHRASE)
    }, [cache, mnemonic, nav])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="space-between" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText typographyFont="title" align="left">
                        {LL.TITLE_MNEMONIC()}
                    </BaseText>

                    <BaseText typographyFont="body" my={10}>
                        {LL.BD_MNEMONIC_SUBTITLE()}
                    </BaseText>

                    <BaseSpacer height={24} />

                    <MnemonicCard mnemonicArray={mnemonicArray} />
                    <BaseSpacer height={20} />
                    <BaseButton
                        size="sm"
                        selfAlign="flex-end"
                        action={onCopyToClipboard}
                        w={100}
                        title={LL.BTN_MNEMONIC_CLIPBOARD()}
                        disabled={!mnemonic}
                        rightIcon={
                            <BaseIcon
                                name="content-copy"
                                color={theme.colors.card}
                                size={10}
                            />
                        }
                    />
                    <BaseSpacer height={28} />

                    <BaseText
                        typographyFont="footNoteAccent"
                        color={theme.colors.danger}
                        my={10}>
                        {LL.BD_MNEMONIC_DISCLAIMER()}
                    </BaseText>

                    <BaseText typographyFont="footNote">
                        {LL.BD_MNEMONIC_BACKUP()}
                    </BaseText>
                </BaseView>

                <BaseView align="center" w={100}>
                    <CheckBoxWithText
                        text={LL.BTN_MNEMONIC_CHECKBOX()}
                        checkAction={setIsChecked}
                    />

                    <BaseButton
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
