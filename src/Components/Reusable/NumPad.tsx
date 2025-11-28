import { Pressable, StyleSheet } from "react-native"
import React, { useCallback, useMemo } from "react"
import { getLocales } from "react-native-localize"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { CURRENCY_FORMATS } from "~Constants"
import { useTheme } from "~Hooks"
import { selectCurrencyFormat, useAppSelector } from "~Storage/Redux"
import { TFonts } from "~Constants/Theme"

const numPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "blank", "0", "canc"]

type Props = {
    onDigitPress: (digit: string) => void
    onDigitDelete: () => void
    typographyFont?: TFonts
    showDecimal?: boolean
}

export const NumPad = ({
    onDigitPress,
    onDigitDelete,
    typographyFont = "biggerTitleMedium",
    showDecimal = false,
}: Props) => {
    const handleOnDigitPress = useCallback(
        (digit: string) => () => {
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    const theme = useTheme()
    const currencyFormat = useAppSelector(selectCurrencyFormat)

    const decimalSeparator = useMemo(() => {
        switch (currencyFormat) {
            case CURRENCY_FORMATS.COMMA:
                return CURRENCY_FORMATS.COMMA
            case CURRENCY_FORMATS.DOT:
                return CURRENCY_FORMATS.DOT
            case CURRENCY_FORMATS.SYSTEM:
                return getLocales()[0].languageCode === "en" ? CURRENCY_FORMATS.DOT : CURRENCY_FORMATS.COMMA
            default:
                return getLocales()[0].languageCode === "en" ? CURRENCY_FORMATS.DOT : CURRENCY_FORMATS.COMMA
        }
    }, [currencyFormat])

    return (
        <BaseView flexDirection="row" flexWrap="wrap" justifyContent="center">
            {numPad.map(digit => {
                const isDeleteKey = digit === "canc"
                const isBlank = digit === "blank"
                const shouldShowDecimal = isBlank && showDecimal
                const shouldRender = digit !== "blank" || shouldShowDecimal

                const onPress = isDeleteKey
                    ? onDigitDelete
                    : handleOnDigitPress(shouldShowDecimal ? decimalSeparator : digit)

                return (
                    <BaseView style={baseStyles.width} key={digit}>
                        {shouldRender ? (
                            <Pressable
                                style={({ pressed }) => [baseStyles.pressable, { opacity: pressed ? 0.5 : 1.0 }]}
                                onPress={onPress}>
                                {isDeleteKey ? (
                                    <BaseIcon name="icon-delete" color={theme.colors.numberPad} />
                                ) : (
                                    <BaseText
                                        color={theme.colors.numberPad}
                                        typographyFont={typographyFont}
                                        alignContainer="center">
                                        {shouldShowDecimal ? decimalSeparator : digit}
                                    </BaseText>
                                )}
                            </Pressable>
                        ) : null}
                    </BaseView>
                )
            })}
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    width: {
        width: "30%",
        paddingHorizontal: 16,
        marginVertical: 8,
        alignItems: "center",
    },
    pressable: {
        width: 64,
        height: 64,
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 40,
    },
})
