import React, { useState } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
} from "~Components"
import { useI18nContext } from "~i18n"
import * as Clipboard from "expo-clipboard"
import { CryptoUtils, SeedUtils, useTheme } from "~Common"
import { Keyboard } from "react-native"
import { Config, Mnemonic, useRealm } from "~Storage"
import { Routes } from "~Navigation"
import { ImportMnemonicView } from "./Components/ImportMnemonicView"
import { useNavigation } from "@react-navigation/native"
import DropShadow from "react-native-drop-shadow"

export const ImportSeedPhraseScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const [, setPasteSeed] = useState<string[]>()
    const [seed, setSeed] = useState<string>("")
    const [isError, setIsError] = useState(false)
    const [isDisabled, setIsDisabled] = useState(true)

    const { store, cache } = useRealm()
    const theme = useTheme()

    const config = store.objectForPrimaryKey<Config>(
        Config.getName(),
        Config.getPrimaryKey(),
    )

    const onVerify = () => {
        if (CryptoUtils.verifySeedPhrase(seed)) {
            cache.write(() => {
                let _mnemonic = cache.objects<Mnemonic>(Mnemonic.getName())
                _mnemonic[0].mnemonic = seed
            })

            if (config?.isWalletCreated) {
                nav.navigate(Routes.WALLET_SUCCESS)
            } else {
                nav.navigate(Routes.APP_SECURITY)
            }
        } else {
            setIsError(true)
        }
    }

    const onPasteFronClipboard = async () => {
        let isString = await Clipboard.hasStringAsync()
        if (isString) {
            let _seed = await Clipboard.getStringAsync()
            let sanified = SeedUtils.sanifySeed(_seed)
            if (sanified.length === 12) {
                setPasteSeed(sanified)
                setSeed(sanified.join(" "))
                setIsDisabled(false)
                Keyboard.dismiss()
            } else {
                setIsDisabled(true)
                setIsError(true)
                setPasteSeed(sanified)
                setSeed(sanified.join(" "))
            }
        }
    }

    const onChangeText = (text: string) => {
        let wordCounter = text.split(" ").filter(str => str !== "").length
        setSeed(text)
        if (wordCounter === 12) {
            setIsDisabled(false)
        } else {
            setIsDisabled(true)
        }
    }

    const onClearSeed = () => {
        setSeed("")
        setPasteSeed([])
        setIsError(false)
    }

    return (
        <DismissKeyboardView>
            <BaseSafeArea grow={1}>
                <BaseSpacer height={20} />
                <BaseView
                    align="center"
                    justify="space-between"
                    grow={1}
                    mx={20}>
                    <BaseView selfAlign="flex-start">
                        <BaseText typographyFont="title">
                            {LL.TITLE_WALLET_IMPORT_LOCAL()}
                        </BaseText>
                        <BaseText typographyFont="body" my={10}>
                            {LL.BD_WALLET_IMPORT_LOCAL()}
                        </BaseText>

                        <BaseSpacer height={20} />

                        <BaseView orientation="row" selfAlign="flex-end">
                            <BaseIcon
                                name={"content-paste"}
                                size={32}
                                style={{ marginHorizontal: 20 }}
                                bg={theme.colors.secondary}
                                action={onPasteFronClipboard}
                            />
                            <BaseIcon
                                name={"trash-can-outline"}
                                size={32}
                                bg={theme.colors.secondary}
                                action={onClearSeed}
                            />
                        </BaseView>

                        <BaseSpacer height={40} />

                        <DropShadow style={theme.shadows.card}>
                            <ImportMnemonicView
                                seed={seed}
                                onChangeText={onChangeText}
                                isError={isError}
                            />
                        </DropShadow>
                        {isError && (
                            <BaseText my={10} color={theme.colors.danger}>
                                {LL.ERROR_INCORRECT_MNEMONIC()}
                            </BaseText>
                        )}
                    </BaseView>

                    <BaseView w={100}>
                        <BaseButton
                            variant="ghost"
                            action={() => {}}
                            typographyFont="footNoteAccent"
                            title={LL.BTN_WALLET_IMPORT_HELP()}
                            selfAlign="center"
                            px={5}
                        />

                        <BaseButton
                            action={onVerify}
                            w={100}
                            title={LL.BTN_IMPORT_WALLET_VERIFY()}
                            disabled={isDisabled}
                        />
                    </BaseView>
                </BaseView>

                <BaseSpacer height={40} />
            </BaseSafeArea>
        </DismissKeyboardView>
    )
}
