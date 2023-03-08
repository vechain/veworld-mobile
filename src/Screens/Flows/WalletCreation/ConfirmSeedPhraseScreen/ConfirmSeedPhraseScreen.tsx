import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
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
import { shuffle } from "lodash"
import { getThreeRandomIndexes } from "./getThreeRandomIndexes"

export const ConfirmSeedPhraseScreen = () => {
    const nav = useNavigation()
    const { store, cache } = useRealm()
    const { LL } = useI18nContext()
    const theme = useTheme()

    const [selectedFirstWord, setSelectedFirstWord] = useState<string | null>(
        null,
    )
    const [selectedSecondWord, setSelectedSecondWord] = useState<string | null>(
        null,
    )
    const [selectedThirdWord, setSelectedThirdWord] = useState<string | null>(
        null,
    )
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

    const mnemonicArray = useMemo(() => mnemonic.split(" "), [mnemonic])
    const [firstIndex, secondIndex, thirdIndex] = useMemo(
        () => getThreeRandomIndexes(),
        [],
    )

    const onConfirmPress = () => {
        if (
            selectedFirstWord === mnemonicArray[firstIndex] &&
            selectedSecondWord === mnemonicArray[secondIndex] &&
            selectedThirdWord === mnemonicArray[thirdIndex]
        ) {
            if (config?.isWalletCreated) {
                nav.navigate(Routes.WALLET_SUCCESS)
            } else {
                nav.navigate(Routes.APP_SECURITY)
            }
        } else {
            setIsError(true)
            setSelectedFirstWord(null)
            setSelectedSecondWord(null)
            setSelectedThirdWord(null)
        }
    }

    /**
     * added near words as options so its easier to catch missing words issues in mnemonic saving
     */
    const buttonsFirstWord = useMemo(
        () =>
            shuffle([
                {
                    id: mnemonicArray[firstIndex],
                    label: mnemonicArray[firstIndex],
                },
                {
                    id: mnemonicArray[firstIndex + 1],
                    label: mnemonicArray[firstIndex + 1],
                },
                {
                    id: mnemonicArray[firstIndex + 2],
                    label: mnemonicArray[firstIndex + 2],
                },
            ]),
        [firstIndex, mnemonicArray],
    )
    const buttonsSecondWord = useMemo(
        () =>
            shuffle([
                {
                    id: mnemonicArray[secondIndex - 1],
                    label: mnemonicArray[secondIndex - 1],
                },
                {
                    id: mnemonicArray[secondIndex],
                    label: mnemonicArray[secondIndex],
                },
                {
                    id: mnemonicArray[secondIndex + 1],
                    label: mnemonicArray[secondIndex + 1],
                },
            ]),
        [mnemonicArray, secondIndex],
    )
    const buttonsThirdWord = useMemo(
        () =>
            shuffle([
                {
                    id: mnemonicArray[thirdIndex - 2],
                    label: mnemonicArray[thirdIndex - 2],
                },
                {
                    id: mnemonicArray[thirdIndex - 1],
                    label: mnemonicArray[thirdIndex - 1],
                },
                {
                    id: mnemonicArray[thirdIndex],
                    label: mnemonicArray[thirdIndex],
                },
            ]),
        [mnemonicArray, thirdIndex],
    )

    const handleSelectFirstWord = useCallback((button: Button) => {
        setSelectedFirstWord(button.id)
        setIsError(false)
    }, [])
    const handleSelectSecondWord = useCallback((button: Button) => {
        setSelectedSecondWord(button.id)
        setIsError(false)
    }, [])
    const handleSelectThirdWord = useCallback((button: Button) => {
        setSelectedThirdWord(button.id)
        setIsError(false)
    }, [])

    const isSubmitDisabled =
        !selectedFirstWord || !selectedSecondWord || !selectedThirdWord

    return (
        <BaseSafeArea grow={1}>
            <BaseView justify="space-between" grow={1} mx={20}>
                <BaseView justify="space-between">
                    <BaseText typographyFont="title">
                        {LL.TITLE_CONFIRM_MNEMONIC()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="body">
                        {LL.BD_SELECT_WORD({ number: firstIndex + 1 })}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseButtonGroup
                        selectedButtonIds={[selectedFirstWord || ""]}
                        buttons={buttonsFirstWord}
                        action={handleSelectFirstWord}
                    />
                    <BaseSpacer height={21} />
                    <BaseText typographyFont="body">
                        {LL.BD_SELECT_WORD({ number: secondIndex + 1 })}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseButtonGroup
                        selectedButtonIds={[selectedSecondWord || ""]}
                        buttons={buttonsSecondWord}
                        action={handleSelectSecondWord}
                    />
                    <BaseSpacer height={21} />
                    <BaseText typographyFont="body">
                        {LL.BD_SELECT_WORD({ number: thirdIndex + 1 })}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseButtonGroup
                        selectedButtonIds={[selectedThirdWord || ""]}
                        buttons={buttonsThirdWord}
                        action={handleSelectThirdWord}
                    />
                    {isError && (
                        <BaseView>
                            <BaseSpacer height={16} />
                            <BaseView
                                orientation="row"
                                align="center"
                                mx={50}
                                justify="center">
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
