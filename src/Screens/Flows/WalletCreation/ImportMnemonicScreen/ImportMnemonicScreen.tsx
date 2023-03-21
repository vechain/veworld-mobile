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
import { CryptoUtils, SeedUtils, useDeviceUtils, useTheme } from "~Common"
import { Keyboard } from "react-native"
import { getConfig, getMnemonic, useRealm } from "~Storage"
import { Routes } from "~Navigation"
import { ImportMnemonicView } from "./Components/ImportMnemonicInput"
import { useNavigation } from "@react-navigation/native"

const DEMO_MNEMONIC =
    "denial kitchen pet squirrel other broom bar gas better priority spoil cross"

export const ImportMnemonicScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const [mnemonic, setMnemonic] = useState<string>("")
    const [isError, setIsError] = useState<string>("")
    const [isDisabled, setIsDisabled] = useState(true)

    const { store, cache } = useRealm()
    const theme = useTheme()

    const config = getConfig(store)

    const { getDeviceFromMnemonic } = useDeviceUtils()

    const onVerify = (_mnemonic: string) => {
        const sanitisedMnemonic = SeedUtils.sanifySeed(_mnemonic).join(" ")
        if (CryptoUtils.verifyMnemonic(sanitisedMnemonic)) {
            try {
                getDeviceFromMnemonic(sanitisedMnemonic)
            } catch (e) {
                setIsError(LL.ERROR_WALLET_ALREADY_EXISTS())
                return
            }

            cache.write(() => {
                let cacheMnemonic = getMnemonic(cache)
                cacheMnemonic.mnemonic = sanitisedMnemonic
            })

            if (config?.isWalletCreated) {
                nav.navigate(Routes.WALLET_SUCCESS)
            } else {
                nav.navigate(Routes.APP_SECURITY)
            }
        } else {
            setIsError(LL.ERROR_INCORRECT_MNEMONIC())
        }
    }

    const onPasteFromClipboard = async () => {
        let isString = await Clipboard.hasStringAsync()
        if (isString) {
            let _seed = await Clipboard.getStringAsync()
            let sanified = SeedUtils.sanifySeed(_seed)
            setMnemonic(sanified.join(" "))
            if (sanified.length === 12) {
                setIsDisabled(false)
                Keyboard.dismiss()
            } else {
                setIsDisabled(true)
                setIsError(LL.ERROR_INCORRECT_MNEMONIC())
            }
        }
    }

    const onDemoMnemonicClick = () => {
        setMnemonic(DEMO_MNEMONIC)
        onVerify(DEMO_MNEMONIC)
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
        setIsError("")
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
                    <BaseView alignSelf="flex-start" w={100}>
                        <BaseView flexDirection="row" w={100}>
                            <BaseText typographyFont="title">
                                {LL.TITLE_WALLET_IMPORT_LOCAL()}
                            </BaseText>
                            {__DEV__ && (
                                <BaseButton
                                    size="md"
                                    variant="link"
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

                        <ImportMnemonicView
                            mnemonic={mnemonic}
                            onChangeText={onChangeText}
                            isError={!!isError}
                        />
                        {!!isError && (
                            <BaseText my={10} color={theme.colors.danger}>
                                {isError}
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
