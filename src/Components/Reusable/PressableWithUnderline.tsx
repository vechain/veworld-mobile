import { StyleSheet, View } from "react-native"
import React, { useCallback, useState } from "react"
import { BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"

type Props = {
    onPress: (button: string) => void
    data: { label: string; value: any; secondaryValue: any }[]
}

export const PressableWithUnderline = (props: Props) => {
    const { onPress, data } = props
    const { styles } = useThemedStyles(baseStyles)
    const [activeIndex, setActiveIndex] = useState(0)

    const onButtonPress = useCallback(
        (button: { label: string }, index: number) => {
            if (index === activeIndex) return
            setActiveIndex(index)
            onPress(button.label)
        },
        [activeIndex, onPress],
    )

    return (
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            {data.map((item, index) => (
                <BaseTouchable
                    haptics="Light"
                    key={item.label}
                    accessibilityRole="button"
                    action={() => onButtonPress(item, index)}
                    style={styles.buttonContainer}>
                    <BaseText fontSize={18}>{item.label}</BaseText>

                    <View
                        style={[
                            // eslint-disable-next-line react-native/no-inline-styles
                            { opacity: activeIndex === index ? 1 : 0 },
                            styles.underline,
                        ]}
                    />
                </BaseTouchable>
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
