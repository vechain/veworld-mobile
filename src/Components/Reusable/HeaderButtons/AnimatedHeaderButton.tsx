import React, { ReactNode } from "react"
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import Animated, { AnimatedStyle } from "react-native-reanimated"
import { BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"

type Props = {
    children: ReactNode
    testID?: string
    animatedStyles?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
    action: () => void
}

export const AnimatedHeaderButton = ({ children, testID, animatedStyles, action }: Props) => {
    const theme = useTheme()

    return (
        <TouchableOpacity testID={testID} onPress={action} activeOpacity={0.7}>
            <BaseView flexDirection="row">
                <Animated.View
                    style={[
                        styles.container,
                        {
                            borderColor: theme.colors.rightIconHeaderBorder,
                            backgroundColor: theme.colors.card,
                        },
                        animatedStyles,
                    ]}>
                    {children}
                </Animated.View>
            </BaseView>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        minWidth: 32,
        borderWidth: 1,
        borderRadius: 6,
        alignContent: "space-between",
        padding: 7,
        flexDirection: "row",
        flexGrow: 1,
    },
})
