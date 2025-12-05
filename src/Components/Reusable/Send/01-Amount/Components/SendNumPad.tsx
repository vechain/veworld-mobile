import React, { useCallback, useMemo } from "react"
import { Pressable, StyleSheet } from "react-native"
import { getLocales } from "react-native-localize"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { CURRENCY_FORMATS } from "~Constants"
import { TFonts } from "~Constants/Theme"
import { useTheme } from "~Hooks"
import { selectCurrencyFormat, useAppSelector } from "~Storage/Redux"
import { getDecimalSeparator } from "~Utils/BigNumberUtils/BigNumberUtils"

// const numPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "blank", "0", "canc"]
const numPad = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["blank", "0", "canc"],
]

type Props = {
    onDigitPress: (digit: string) => void
    onDigitDelete: () => void
    typographyFont?: TFonts
    showDecimal?: boolean
}

export const SendNumPad = ({
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
            default: {
                const locale = getLocales()[0].languageCode
                return getDecimalSeparator(locale) ?? CURRENCY_FORMATS.DOT
            }
        }
    }, [currencyFormat])

    return (
        <BaseView flexDirection="column" gap={8}>
            {numPad.map((digits, idx) => {
                return (
                    <BaseView flexDirection="row" justifyContent="space-between" key={idx}>
                        {digits.map(digit => {
                            const isDeleteKey = digit === "canc"
                            const isBlank = digit === "blank"
                            const shouldShowDecimal = isBlank && showDecimal
                            const shouldRender = digit !== "blank" || shouldShowDecimal
                            const decimalType = shouldShowDecimal ? decimalSeparator : digit
                            const onPress = isDeleteKey ? onDigitDelete : handleOnDigitPress(decimalType)

                            return (
                                <BaseView style={baseStyles.width} key={digit}>
                                    {shouldRender ? (
                                        <Pressable
                                            style={({ pressed }) => [
                                                baseStyles.pressable,
                                                { opacity: pressed ? 0.5 : 1.0 },
                                            ]}
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
            })}
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    width: {
        alignItems: "center",
        height: 56,
        padding: 8,
        flex: 1,
    },
    pressable: {
        // width: 64,
        // height: 56,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
})
