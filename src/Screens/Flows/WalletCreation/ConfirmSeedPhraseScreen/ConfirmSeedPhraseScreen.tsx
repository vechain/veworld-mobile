import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useState } from "react"
import { useTheme } from "~Common"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { BaseButtonGroup, Button } from "~Components/Base/BaseButtonGroup"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { Config, Mnemonic, useRealm } from "~Storage"

export const ConfirmSeedPhraseScreen = () => {
    const nav = useNavigation()
    const { store, cache } = useRealm()
    const { LL } = useI18nContext()
    const theme = useTheme()

    const [selectedWord1, setSelectedWord1] = useState<string | null>(null)
    const [selectedWord6, setSelectedWord6] = useState<string | null>(null)
    const [selectedWord12, setSelectedWord12] = useState<string | null>(null)
    const [isError, setIsError] = useState(false)

    const config = store.objectForPrimaryKey<Config>(
        Config.getName(),
        Config.getPrimaryKey(),
    )

    const mnemonic = cache.objectForPrimaryKey<Mnemonic>(
        Mnemonic.getName(),
        Mnemonic.getPrimaryKey(),
    )?.mnemonic

    /**
     * if mnemonic is not available something strange is happening, better to throw an error and crash the app
     */
    if (!mnemonic) {
        throw new Error("ConfirmSeedPhraseScreen: Mnemonic is not available")
    }

    const mnemonicArray = mnemonic.split(" ")

    const onConfirmPress = () => {
        if (
            selectedWord1 === mnemonicArray[0] &&
            selectedWord6 === mnemonicArray[5] &&
            selectedWord12 === mnemonicArray[11]
        ) {
            if (config?.isWalletCreated) {
                nav.navigate(Routes.WALLET_SUCCESS)
            } else {
                nav.navigate(Routes.APP_SECURITY)
            }
        } else {
            setIsError(true)
            setSelectedWord1(null)
            setSelectedWord6(null)
            setSelectedWord12(null)
        }
    }

    /**
     * added near words as options so its easier to catch missing words issues in mnemonic saving
     */
    const buttonsWord1 = [
        { id: mnemonicArray[0], label: mnemonicArray[0] }, // the right one
        { id: mnemonicArray[1], label: mnemonicArray[1] },
        { id: mnemonicArray[2], label: mnemonicArray[2] },
    ]
    const buttonsWord6 = [
        { id: mnemonicArray[4], label: mnemonicArray[4] },
        { id: mnemonicArray[5], label: mnemonicArray[5] }, // the right one
        { id: mnemonicArray[6], label: mnemonicArray[6] },
    ]
    const buttonsWord12 = [
        { id: mnemonicArray[9], label: mnemonicArray[9] },
        { id: mnemonicArray[10], label: mnemonicArray[10] },
        { id: mnemonicArray[11], label: mnemonicArray[11] }, // the right one
    ]

    const handleSelectWord1 = useCallback((button: Button) => {
        setSelectedWord1(button.id)
        setIsError(false)
    }, [])
    const handleSelectWord6 = useCallback((button: Button) => {
        setSelectedWord6(button.id)
        setIsError(false)
    }, [])
    const handleSelectWord12 = useCallback((button: Button) => {
        setSelectedWord12(button.id)
        setIsError(false)
    }, [])

    const isSubmitDisabled = !selectedWord1 || !selectedWord6 || !selectedWord12

    return (
        <BaseSafeArea grow={1}>
            <BaseView justify="space-between" grow={1} mx={20}>
                <BaseView justify="space-between">
                    <BaseText typographyFont="title">
                        {LL.TITLE_CONFIRM_MNEMONIC()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="body">
                        {LL.BD_SELECT_WORD_1()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseButtonGroup
                        selectedButtonIds={[selectedWord1 || ""]}
                        buttons={buttonsWord1}
                        action={handleSelectWord1}
                    />
                    <BaseSpacer height={21} />
                    <BaseText typographyFont="body">
                        {LL.BD_SELECT_WORD_6()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseButtonGroup
                        selectedButtonIds={[selectedWord6 || ""]}
                        buttons={buttonsWord6}
                        action={handleSelectWord6}
                    />
                    <BaseSpacer height={21} />
                    <BaseText typographyFont="body">
                        {LL.BD_SELECT_WORD_7()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseButtonGroup
                        selectedButtonIds={[selectedWord12 || ""]}
                        buttons={buttonsWord12}
                        action={handleSelectWord12}
                    />
                    {isError && (
                        <BaseView mx={20}>
                            <BaseSpacer height={16} />
                            <BaseView orientation="row" align="center">
                                <BaseIcon
                                    name={"alert-circle-outline"}
                                    size={20}
                                    color={theme.colors.danger}
                                />
                                <BaseText
                                    typographyFont="body"
                                    fontSize={12}
                                    color={theme.colors.danger}>
                                    {LL.ERROR_WRONG_MNEMONIC_WORDS()}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    )}
                </BaseView>
                <BaseButton
                    action={onConfirmPress}
                    w={100}
                    px={20}
                    title={"Confirm"}
                    disabled={isSubmitDisabled}
                    radius={16}
                />
            </BaseView>

            <BaseSpacer height={20} />
        </BaseSafeArea>
    )
}
