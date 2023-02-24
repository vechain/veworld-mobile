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
import { CryptoUtils, SeedUtils } from "~Common"
import { Keyboard } from "react-native"
import { Config, Mnemonic, useRealm } from "~Storage"
import { Routes } from "~Navigation"
import { ImportMnemonicView } from "./Components/ImportMnemonicView"
import { useNavigation } from "@react-navigation/native"

export const ImportSeedPhraseScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const [, setPasteSeed] = useState<string[]>()
    const [seed, setSeed] = useState<string>("")
    const [isError, setIsError] = useState(false)
    const [isDisabled, setIsDisabled] = useState(true)

    const { store, cache } = useRealm()

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

                        <ImportMnemonicView
                            seed={seed}
                            onChangeText={onChangeText}
                            isError={isError}
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
