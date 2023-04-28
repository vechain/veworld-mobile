import { StyleSheet, View, Pressable } from "react-native"
import React, { useCallback, useState } from "react"
import { BaseText, BaseView } from "~Components/Base"
import { ColorThemeType, useThemedStyles } from "~Common"
import { COLORS } from "~Common/Theme"

type Props = {
    onPress: (button: number) => void
}

const timelineDays = [
    { label: "1D", value: 1 },
    { label: "1W", value: 7 },
    { label: "1M", value: 30 },
    { label: "All", value: 0 },
]

export const PressableWithUnderline = (props: Props) => {
    const { onPress } = props
    const { styles } = useThemedStyles(baseStyles)
    const [activeIndex, setActiveIndex] = useState(0)

    const onButtonPress = useCallback(
        (button: { label: string; value: number }, index: number) => {
            setActiveIndex(index)
            onPress(button.value)
        },
        [onPress],
    )

    return (
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            {timelineDays.map((item, index) => (
                <Pressable
                    key={item.label}
                    accessibilityRole="button"
                    onPress={() => onButtonPress(item, index)}
                    style={styles.buttonContainer}>
                    <BaseText fontSize={18}>{item.label}</BaseText>

                    <View
                        style={[
                            // eslint-disable-next-line react-native/no-inline-styles
                            { opacity: activeIndex === index ? 1 : 0 },
                            styles.underline,
                        ]}
                    />
                </Pressable>
            ))}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        buttonContainer: {
            justifyContent: "center",
            alignItems: "center",
        },
        underline: {
            marginTop: 4,
            backgroundColor: theme.isDark ? COLORS.GRAY : COLORS.DARK_PURPLE,
            height: 4,
            width: 12,
            borderRadius: 2,
            overflow: "hidden",
        },
    })
