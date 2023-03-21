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
import { getConfig, getMnemonic, useRealm } from "~Storage"
import { Routes } from "~Navigation"
import { ImportMnemonicView } from "./Components/ImportMnemonicView"
import { useNavigation } from "@react-navigation/native"
import DropShadow from "react-native-drop-shadow"

const DEMO_MNEMONIC =
    "denial kitchen pet squirrel other broom bar gas better priority spoil cross"

export const ImportMnemonicScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const [mnemonic, setMnemonic] = useState<string>("")
    const [isError, setIsError] = useState(false)
    const [isDisabled, setIsDisabled] = useState(true)

    const { store, cache } = useRealm()
    const theme = useTheme()

    const config = getConfig(store)

    const onVerify = (_mnemonic: string) => {
        if (CryptoUtils.verifyMnemonic(_mnemonic)) {
            cache.write(() => {
                let cacheMnemonic = getMnemonic(cache)
                cacheMnemonic.mnemonic = _mnemonic
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

    const onPasteFromClipboard = async () => {
        let isString = await Clipboard.hasStringAsync()
        if (isString) {
            let _seed = await Clipboard.getStringAsync()
            let sanified = SeedUtils.sanifySeed(_seed)
            if (sanified.length === 12) {
                setMnemonic(sanified.join(" "))
                setIsDisabled(false)
                Keyboard.dismiss()
            } else {
                setIsDisabled(true)
                setIsError(true)
                setMnemonic(sanified.join(" "))
            }
        }
    }

    const onDemoMnemonicClick = () => {
        const sanitisedDemoMnemonic =
            SeedUtils.sanifySeed(DEMO_MNEMONIC).join(" ")
        onVerify(sanitisedDemoMnemonic)
    }

    const onChangeText = (text: string) => {
        let wordCounter = text.split(" ").filter(str => str !== "").length
        setMnemonic(text)
        if (wordCounter === 12) {
            setIsDisabled(false)
        } else {
            setIsDisabled(true)
        }
    }

    const onClearSeed = () => {
        setMnemonic("")
        setIsError(false)
    }

    return (
        <DismissKeyboardView>
            <BaseSafeArea grow={1}>
                <BaseSpacer height={20} />
                <BaseView
                    alignItems="center"
                    justifyContent="space-between"
                    flexGrow={1}
                    mx={20}>
                    <BaseView alignSelf="flex-start">
                        <BaseView flexDirection="row">
                            <BaseText typographyFont="title">
                                {LL.TITLE_WALLET_IMPORT_LOCAL()}
                            </BaseText>
                            {__DEV__ && (
                                <BaseButton
                                    size="md"
                                    action={onDemoMnemonicClick}
                                    title="DEV:DEMO"
                                />
                            )}
                        </BaseView>
                        <BaseText typographyFont="body" my={10}>
                            {LL.BD_WALLET_IMPORT_LOCAL()}
                        </BaseText>

                        <BaseSpacer height={20} />

                        <BaseView flexDirection="row" alignSelf="flex-end">
                            <BaseIcon
                                name={"content-paste"}
                                size={32}
                                style={{ marginHorizontal: 20 }}
                                bg={theme.colors.secondary}
                                action={onPasteFromClipboard}
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
                                mnemonic={mnemonic}
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
                            px={5}
                        />

                        <BaseButton
                            action={() => onVerify(mnemonic)}
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
