import React from "react"
import { StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { BaseIcon } from "~Components/Base"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"

type Props = {
    icon: IconKey
}

const GRADIENT_COLORS = ["#820744", "#211EAB"]
const GRADIENT_ANGLE = 132
const GRADIENT_START = { x: 0.15, y: 0 }
const GRADIENT_END = { x: 0.87, y: 1 }

export const StargateIcon = ({ icon }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <LinearGradient
            colors={GRADIENT_COLORS}
            angle={GRADIENT_ANGLE}
            start={GRADIENT_START}
            end={GRADIENT_END}
            style={styles.icon}>
            <BaseIcon name={icon} size={12} color={COLORS.WHITE} />
        </LinearGradient>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            padding: 6,
        },
    })
