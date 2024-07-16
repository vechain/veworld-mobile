import React from "react"
import { View, Text, StyleSheet } from "react-native"
import Animated, { useAnimatedStyle, SharedValue } from "react-native-reanimated"

type Props = {
    strength: SharedValue<number>
}

export const PasswordStrengthIndicator = ({ strength }: Props) => {
    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${strength.value * 20}%`,
            backgroundColor: strength.value < 3 ? "red" : strength.value < 4 ? "orange" : "green",
        }
    })

    return (
        <View style={styles.container}>
            <View style={styles.barBackground}>
                <Animated.View style={[styles.bar, animatedStyle]} />
            </View>
            <Text>
                {"Password Strength:"} {strength.value}/5
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 18,
        paddingHorizontal: 4,
        justifyContent: "center",
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    barBackground: {
        height: 10,
        backgroundColor: "#e0e0e0",
        borderRadius: 5,
        overflow: "hidden",
    },
    bar: {
        height: 10,
        borderRadius: 5,
    },
})

export default PasswordStrengthIndicator
