import React, { useState } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
    PressableIcon,
} from "~Components"
import { Fonts } from "~Model"
import { useI18nContext } from "~i18n"
import * as Clipboard from "expo-clipboard"
import { SeedUtils, useTheme } from "~Common"
import { Keyboard, TextInput } from "react-native"

export const ImportSeedPhraseScreen = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const [, setPastedSeed] = useState<string[]>()
    const [seed, setSeed] = useState<string>("")
    const [, serIsError] = useState(false)

    const onVarify = () => {
        // TODO: varify seed is valid (create wallet in bg)
    }

    const onPasteFronClipboard = async () => {
        let isString = await Clipboard.hasStringAsync()
        if (isString) {
            let _seed = await Clipboard.getStringAsync()
            let sanified = SeedUtils.sanifySeed(_seed)
            if (sanified.length === 12) {
                setPastedSeed(sanified)
                setSeed(sanified.join(" "))
                Keyboard.dismiss()
            } else {
                serIsError(true)
                onClearSeed()
            }
        }
    }

    const onClearSeed = () => {
        setSeed("")
        setPastedSeed([])
    }

    return (
        <DismissKeyboardView grow={1}>
            <BaseSafeArea grow={1}>
                <BaseSpacer height={20} />
                <BaseView
                    align="center"
                    justify="space-between"
                    grow={1}
                    mx={20}>
                    <BaseView selfAlign="flex-start">
                        <BaseText font={Fonts.large_title}>
                            {LL.TITLE_WALLET_IMPORT_LOCAL()}
                        </BaseText>
                        <BaseText font={Fonts.body} my={10}>
                            {LL.BD_WALLET_IMPORT_LOCAL()}
                        </BaseText>

                        <BaseSpacer height={20} />

                        <BaseView orientation="row" selfAlign="flex-end">
                            <PressableIcon
                                title="clipboard-outline"
                                action={onPasteFronClipboard}
                                mx={20}
                                size={26}
                            />
                            <PressableIcon
                                title="trash-outline"
                                action={onClearSeed}
                                size={26}
                            />
                        </BaseView>

                        <BaseSpacer height={40} />

                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: "black",
                                borderRadius: 8,
                                padding: 20,
                                height: 140,
                                fontSize: theme.typography.body_accent.fontSize,
                                fontFamily:
                                    theme.typography.body_accent.fontFamily,
                                lineHeight: 28,
                            }}
                            autoCapitalize="none"
                            autoComplete="off"
                            multiline={true}
                            numberOfLines={4}
                            onChangeText={setSeed}
                            value={seed}
                        />
                    </BaseView>

                    <BaseView w={100}>
                        <BaseButton
                            action={() => {}}
                            font={Fonts.footnote_accent}
                            title={LL.BTN_WALLET_IMPORT_HELP()}
                            selfAlign="flex-start"
                            px={5}
                        />

                        <BaseButton
                            filled
                            action={onVarify}
                            w={100}
                            title={LL.BTN_IMPORT_WALLET_VARIFY()}
                            disabled={true}
                        />
                    </BaseView>
                </BaseView>

                <BaseSpacer height={40} />
            </BaseSafeArea>
        </DismissKeyboardView>
    )
}
