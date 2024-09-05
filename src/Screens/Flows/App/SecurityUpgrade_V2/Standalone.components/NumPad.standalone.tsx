import React, { useCallback } from "react"
import { Pressable, StyleSheet } from "react-native"
import { widthPercentageToDP as wp } from "react-native-responsive-screen"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { ColorThemeType, valueToHP } from "~Constants"
import { useThemedStyles } from "~Hooks"

const numPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "blank", "0", "canc"]

export type NumPadProps = {
    onDigitPress: (digit: string) => void
    onDigitDelete: () => void
}

export const NumPad = ({ onDigitPress, onDigitDelete }: NumPadProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const handleOnDigitPress = useCallback(
        (digit: string) => () => {
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    return (
        <BaseView flexDirection="row" flexWrap="wrap" bg={theme.colors.background}>
            {numPad.map((digit, index) => {
                const isDeleteKey = digit === "canc"
                const onPress = isDeleteKey ? onDigitDelete : handleOnDigitPress(digit)
                return (
                    <BaseView style={styles.width} key={index}>
                        {digit !== "blank" ? (
                            <Pressable
                                style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.5 : 1.0 }]}
                                onPress={onPress}>
                                {digit !== "canc" ? (
                                    <BaseText typographyFont="largeTitleAccent" alignContainer="center">
                                        {digit}
                                    </BaseText>
                                ) : (
                                    <BaseIcon name="backspace-outline" color={theme.colors.text} />
                                )}
                            </Pressable>
                        ) : null}
                    </BaseView>
                )
            })}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        width: {
            width: "33%",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: valueToHP[22],
        },
        pressable: {
            width: wp("18%"),
            height: wp("18%"),
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.card,
            borderRadius: wp("9%"),
        },
    })
