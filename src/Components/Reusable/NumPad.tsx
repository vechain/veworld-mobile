import { Dimensions, Pressable, StyleSheet } from "react-native"
import React, { useCallback } from "react"
import { BaseText, BaseView } from "~Components"
import * as Haptics from "expo-haptics"
import { ColorThemeType, useThemedStyles } from "~Common"
import DropShadow from "react-native-drop-shadow"

const numPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "blank", "0", "*"]

type Props = {
    onDigitPress: (digit: string) => void
}

export const NumPad = ({ onDigitPress }: Props) => {
    const { theme, styles } = useThemedStyles(baseStyles)
    const onPress = useCallback(
        (digit: string) => () => {
            onDigitPress(digit)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        [onDigitPress],
    )

    return (
        <BaseView flexDirection="row" flexWrap="wrap" w={100}>
            {numPad.map((digit, index) => (
                <BaseView style={styles.width} key={index}>
                    {digit !== "blank" ? (
                        <DropShadow style={theme.shadows.card}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.pressable,
                                    { opacity: pressed ? 0.5 : 1.0 },
                                ]}
                                onPress={onPress(digit)}>
                                <BaseText
                                    typographyFont="largeTitleAccent"
                                    alignContainer="center">
                                    {digit}
                                </BaseText>
                            </Pressable>
                        </DropShadow>
                    ) : null}
                </BaseView>
            ))}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        width: {
            width: "33%",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 22,
        },
        pressable: {
            paddingVertical: 12,
            paddingHorizontal: 24,
            backgroundColor: theme.colors.card,
            borderRadius: Dimensions.get("window").width * 0.5,
        },
    })
