import { Pressable, StyleSheet } from "react-native"
import React, { useCallback } from "react"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"

const numPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "blank", "0", "canc"]

type Props = {
    onDigitPress: (digit: string) => void
    onDigitDelete: () => void
}

export const NumPad = ({ onDigitPress, onDigitDelete }: Props) => {
    const handleOnDigitPress = useCallback(
        (digit: string) => () => {
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    const theme = useTheme()

    return (
        <BaseView flexDirection="row" flexWrap="wrap" justifyContent="center">
            {numPad.map((digit, index) => {
                const isDeleteKey = digit === "canc"
                const onPress = isDeleteKey ? onDigitDelete : handleOnDigitPress(digit)
                return (
                    <BaseView style={baseStyles.width} key={index}>
                        {digit !== "blank" ? (
                            <Pressable
                                style={({ pressed }) => [baseStyles.pressable, { opacity: pressed ? 0.5 : 1.0 }]}
                                onPress={onPress}>
                                {digit !== "canc" ? (
                                    <BaseText
                                        color={theme.colors.numberPad}
                                        typographyFont="biggerTitleMedium"
                                        alignContainer="center">
                                        {digit}
                                    </BaseText>
                                ) : (
                                    <BaseIcon name="icon-delete" color={theme.colors.text} />
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
        width: 80,
        height: 80,
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 40,
    },
})
