import { Pressable, StyleSheet } from "react-native"
import React, { useCallback } from "react"
import { BaseText, BaseView } from "~Components"
import { Fonts } from "~Model"

const numPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "blank", "0", "*"]

type Props = {
    onDigitPress: (digit: string) => void
}

export const NumPad = ({ onDigitPress }: Props) => {
    const onPress = useCallback(
        (digit: string) => () => {
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    return (
        <BaseView orientation="row" wrap w={100}>
            {numPad.map((digit, index) => (
                <BaseView style={baseStyles.width} key={index}>
                    {digit !== "blank" ? (
                        <Pressable
                            onPress={onPress(digit)}
                            style={baseStyles.paddingH}>
                            <BaseText
                                font={Fonts.large_title_accent}
                                alignContainer="center">
                                {digit}
                            </BaseText>
                        </Pressable>
                    ) : null}
                </BaseView>
            ))}
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    width: {
        width: "33%",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 22,
    },
    paddingH: {
        paddingHorizontal: 10,
    },
})
