import { Pressable, StyleSheet } from "react-native"
import React, { memo, useCallback } from "react"
import { BaseText, BaseView } from "~Components"
import Animated, { FadeIn } from "react-native-reanimated"
import { ColorThemeType, useThemedStyles } from "~Common"

type Props = {
    action: (activeScreen: number) => void
    activeScreen: number
}

const entries = [
    {
        label: "Token",
        value: 0,
    },
    {
        label: "NFT",
        value: 1,
    },
]
export const TabbarHeader: React.FC<Props> = memo(
    ({ action, activeScreen }) => {
        const { styles } = useThemedStyles(baseStyles)

        const onScreenChange = useCallback(
            (value: number) => () => action(value),
            [action],
        )

        return (
            <BaseView align="center">
                <BaseView
                    w={50}
                    orientation="row"
                    justify="space-between"
                    align="center">
                    {entries.map(entry => {
                        const isSelected = activeScreen === entry.value
                        return (
                            <Pressable
                                key={entry.value}
                                onPress={onScreenChange(entry.value)}
                                style={styles.button}>
                                <BaseText
                                    typographyFont={
                                        isSelected
                                            ? "subTitle"
                                            : "subTitleLight"
                                    }>
                                    {entry.label}
                                </BaseText>
                                {isSelected && (
                                    <Animated.View
                                        style={styles.underline}
                                        entering={FadeIn.duration(400)}
                                    />
                                )}
                            </Pressable>
                        )
                    })}
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        underline: {
            height: 4,
            borderRadius: 10,
            backgroundColor: theme.colors.text,
            marginTop: 5,
            width: 20,
        },
        button: {
            paddingHorizontal: 10,
            paddingTop: 10,
            alignItems: "center",
            justifyContent: "center",
        },
    })
