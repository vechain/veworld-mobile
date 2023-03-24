import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { useTheme, CryptoUtils } from "~Common"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import {
    BaseButtonGroup,
    Button as ButtonType,
} from "~Components/Base/BaseButtonGroup"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { getThreeRandomIndexes } from "./getThreeRandomIndexes"
import { useAppSelector } from "~Storage/Redux"
import { getMnemonic, selectIsWalletCreated } from "~Storage/Redux/Selectors"

export const ConfirmMnemonicScreen = () => {
    const nav = useNavigation()
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

    const mnemonic = useAppSelector(getMnemonic)

    const isWalletCreated = useAppSelector(selectIsWalletCreated)

    /**
     * if mnemonic is not available something strange is happening, better to throw an error and crash the app
     */
    if (!mnemonic) {
        throw new Error("ConfirmMnemonicScreen: Mnemonic is not available")
    }

    const mnemonicArray = useMemo(
        () => mnemonic.value?.split(" ") || [],
        [mnemonic],
    )
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
            if (isWalletCreated) {
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
            CryptoUtils.shuffleArray([
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
            CryptoUtils.shuffleArray([
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
            CryptoUtils.shuffleArray([
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

    const handleSelectFirstWord = useCallback((button: ButtonType) => {
        setSelectedFirstWord(button.id)
        setIsError(false)
    }, [])
    const handleSelectSecondWord = useCallback((button: ButtonType) => {
        setSelectedSecondWord(button.id)
        setIsError(false)
    }, [])
    const handleSelectThirdWord = useCallback((button: ButtonType) => {
        setSelectedThirdWord(button.id)
        setIsError(false)
    }, [])

    const isSubmitDisabled =
        !selectedFirstWord || !selectedSecondWord || !selectedThirdWord

    return (
        <BaseSafeArea grow={1}>
            <BaseView
                justifyContent="space-between"
                alignItems="flex-start"
                flexGrow={1}
                mx={20}>
                <BaseView
                    justifyContent="space-between"
                    alignItems="stretch"
                    w={100}>
                    <BaseView
                        flexDirection="row"
                        justifyContent="space-between"
                        w={100}>
                        <BaseText align="left" typographyFont="title">
                            {LL.TITLE_CONFIRM_MNEMONIC()}
                        </BaseText>
                        {__DEV__ && (
                            <BaseButton
                                variant="link"
                                action={() =>
                                    isWalletCreated
                                        ? nav.navigate(Routes.WALLET_SUCCESS)
                                        : nav.navigate(Routes.APP_SECURITY)
                                }
                                title="DEV:SKIP"
                            />
                        )}
                    </BaseView>
                    <BaseSpacer height={16} />
                    <BaseText align="left" typographyFont="body">
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
                                flexDirection="row"
                                mx={50}
                                justifyContent="center">
                                <BaseIcon
                                    name={"alert-circle-outline"}
                                    size={20}
                                    color={theme.colors.danger}
                                />
                                <BaseSpacer width={8} />
                                <BaseText
                                    typographyFont="body"
                                    fontSize={12}
                                    color={theme.colors.danger}>
                                    {LL.ERROR_WRONG_MNEMONIC_WORDS()}
                                </BaseText>
                                <BaseSpacer height={24} />
                            </BaseView>
                        </BaseView>
                    )}
                </BaseView>
                <BaseButton
                    action={onConfirmPress}
                    w={100}
                    px={20}
                    title={LL.COMMON_BTN_CONFIRM()}
                    disabled={isSubmitDisabled}
                    radius={16}
                />
            </BaseView>

            <BaseSpacer height={20} />
        </BaseSafeArea>
    )
}
