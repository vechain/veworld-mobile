import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { useAnalyticTracking, useTheme } from "~Hooks"
import { CryptoUtils } from "~Utils"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    showErrorToast,
} from "~Components"
import {
    BaseButtonGroup,
    Button as ButtonType,
} from "~Components/Base/BaseButtonGroup"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { getThreeRandomIndexes } from "./getThreeRandomIndexes"
import { selectAreDevFeaturesEnabled, useAppSelector } from "~Storage/Redux"
import { selectHasOnboarded, selectMnemonic } from "~Storage/Redux/Selectors"
import { AnalyticsEvent, valueToHP } from "~Constants"

export const ConfirmMnemonicScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const theme = useTheme()
    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)
    const track = useAnalyticTracking()

    const [selectedFirstWord, setSelectedFirstWord] = useState<string | null>(
        null,
    )
    const [selectedSecondWord, setSelectedSecondWord] = useState<string | null>(
        null,
    )
    const [selectedThirdWord, setSelectedThirdWord] = useState<string | null>(
        null,
    )

    const mnemonic = useAppSelector(selectMnemonic)

    const userHasOnboarded = useAppSelector(selectHasOnboarded)

    const mnemonicArray = useMemo(() => mnemonic?.split(" ") || [], [mnemonic])

    const [firstIndex, secondIndex, thirdIndex] = useMemo(
        () => getThreeRandomIndexes(),
        [],
    )

    // Filter out the 3 words we are challenging the user to find
    // and shuffle the remaining words
    const fillerMnemonicArray = useMemo(() => {
        const updatedArray: Array<string> = []

        mnemonicArray.forEach((word, index) => {
            if (
                index !== firstIndex &&
                index !== secondIndex &&
                index !== thirdIndex
            )
                updatedArray.push(word)
        })

        return CryptoUtils.shuffleArray(updatedArray)
    }, [mnemonicArray, firstIndex, secondIndex, thirdIndex])

    const onConfirmPress = () => {
        track(AnalyticsEvent.NEW_WALLET_VERIFICATION_ATTEMPTED)
        if (
            selectedFirstWord === mnemonicArray[firstIndex] &&
            selectedSecondWord === mnemonicArray[secondIndex] &&
            selectedThirdWord === mnemonicArray[thirdIndex]
        ) {
            track(AnalyticsEvent.NEW_WALLET_VERIFICATION_SUCCESS)

            if (userHasOnboarded) {
                nav.navigate(Routes.WALLET_SUCCESS)
            } else {
                nav.navigate(Routes.APP_SECURITY)
            }
        } else {
            track(AnalyticsEvent.NEW_WALLET_VERIFICATION_FAILED)

            showErrorToast(
                LL.ERROR_WRONG_WORDS_COMBINATION(),
                LL.ERROR_WRONG_WORDS_COMBINATION_DESC(),
            )
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
            CryptoUtils.shuffleArray([
                {
                    id: mnemonicArray[firstIndex],
                    label: mnemonicArray[firstIndex],
                },
                {
                    id: fillerMnemonicArray[0],
                    label: fillerMnemonicArray[0],
                },
                {
                    id: fillerMnemonicArray[1],
                    label: fillerMnemonicArray[1],
                },
            ]),
        [mnemonicArray, fillerMnemonicArray, firstIndex],
    )

    const buttonsSecondWord = useMemo(
        () =>
            CryptoUtils.shuffleArray([
                {
                    id: mnemonicArray[secondIndex],
                    label: mnemonicArray[secondIndex],
                },
                {
                    id: fillerMnemonicArray[2],
                    label: fillerMnemonicArray[2],
                },
                {
                    id: fillerMnemonicArray[3],
                    label: fillerMnemonicArray[3],
                },
            ]),
        [mnemonicArray, fillerMnemonicArray, secondIndex],
    )
    const buttonsThirdWord = useMemo(
        () =>
            CryptoUtils.shuffleArray([
                {
                    id: mnemonicArray[thirdIndex],
                    label: mnemonicArray[thirdIndex],
                },
                {
                    id: fillerMnemonicArray[4],
                    label: fillerMnemonicArray[4],
                },
                {
                    id: fillerMnemonicArray[5],
                    label: fillerMnemonicArray[5],
                },
            ]),
        [mnemonicArray, fillerMnemonicArray, thirdIndex],
    )

    const handleSelectFirstWord = useCallback((button: ButtonType) => {
        setSelectedFirstWord(button.id)
    }, [])
    const handleSelectSecondWord = useCallback((button: ButtonType) => {
        setSelectedSecondWord(button.id)
    }, [])
    const handleSelectThirdWord = useCallback((button: ButtonType) => {
        setSelectedThirdWord(button.id)
    }, [])

    const isSubmitDisabled =
        !selectedFirstWord || !selectedSecondWord || !selectedThirdWord

    return (
        <Layout
            body={
                <BaseView justifyContent="space-between" flexGrow={1}>
                    <BaseView justifyContent="space-between">
                        <BaseView
                            flexDirection="row"
                            justifyContent="space-between">
                            <BaseText align="left" typographyFont="title">
                                {LL.TITLE_CONFIRM_MNEMONIC()}
                            </BaseText>
                            {devFeaturesEnabled && (
                                <BaseButton
                                    px={0}
                                    py={0}
                                    variant="link"
                                    action={() =>
                                        userHasOnboarded
                                            ? nav.navigate(
                                                  Routes.WALLET_SUCCESS,
                                              )
                                            : nav.navigate(Routes.APP_SECURITY)
                                    }
                                    title="DEV:SKIP"
                                />
                            )}
                        </BaseView>
                        <BaseSpacer height={valueToHP[16]} />
                        <BaseText align="left" typographyFont="body">
                            {LL.BD_SELECT_WORD({ number: firstIndex + 1 })}
                        </BaseText>
                        <BaseSpacer height={valueToHP[16]} />
                        <BaseButtonGroup
                            selectedButtonIds={[selectedFirstWord || ""]}
                            buttons={buttonsFirstWord}
                            action={handleSelectFirstWord}
                            selectedColor={theme.colors.primaryLight}
                            buttonGroupTestID="first-word-button-group"
                            buttonTestID="word-1"
                        />
                        <BaseSpacer height={valueToHP[21]} />
                        <BaseText typographyFont="body">
                            {LL.BD_SELECT_WORD({ number: secondIndex + 1 })}
                        </BaseText>
                        <BaseSpacer height={valueToHP[16]} />
                        <BaseButtonGroup
                            selectedButtonIds={[selectedSecondWord || ""]}
                            buttons={buttonsSecondWord}
                            action={handleSelectSecondWord}
                            selectedColor={theme.colors.primaryLight}
                            buttonGroupTestID="second-word-button-group"
                            buttonTestID="word-2"
                        />
                        <BaseSpacer height={21} />
                        <BaseText typographyFont="body">
                            {LL.BD_SELECT_WORD({ number: thirdIndex + 1 })}
                        </BaseText>
                        <BaseSpacer height={valueToHP[16]} />
                        <BaseButtonGroup
                            selectedButtonIds={[selectedThirdWord || ""]}
                            buttons={buttonsThirdWord}
                            action={handleSelectThirdWord}
                            selectedColor={theme.colors.primaryLight}
                            buttonGroupTestID="third-word-button-group"
                            buttonTestID="word-3"
                        />
                    </BaseView>
                    <BaseSpacer height={20} />
                </BaseView>
            }
            footer={
                <BaseButton
                    haptics="Medium"
                    action={onConfirmPress}
                    w={100}
                    px={20}
                    title={LL.COMMON_BTN_CONFIRM()}
                    disabled={isSubmitDisabled}
                    radius={16}
                />
            }
        />
    )
}
