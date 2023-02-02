import React from "react"
import {
    StyleProp,
    ViewStyle,
    ViewProps,
    View,
    Text,
    StyleSheet,
} from "react-native"
import type { AnimateProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"

interface Props extends AnimateProps<ViewProps> {
    style?: StyleProp<ViewStyle>
    index: number
}

export const Card: React.FC<Props> = props => {
    const { style, index, ...animatedViewProps } = props

    return (
        <Animated.View style={baseStyles.container} {...animatedViewProps}>
            <View style={[baseStyles.itemContainer, style]}>
                <Text style={{ fontSize: 30, color: "white" }}>{index}</Text>
            </View>
        </Animated.View>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#28008C",
        borderRadius: 22,
    },
})
