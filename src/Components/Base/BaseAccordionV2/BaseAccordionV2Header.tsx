import React, { useCallback } from "react"
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { useBaseAccordionV2 } from "./BaseAccordionV2Context"

export const BaseAccordionV2Header = ({
    style,
    children,
}: Omit<PressableProps, "style"> & { style?: StyleProp<ViewStyle> }) => {
    const { styles } = useThemedStyles(baseStyles)
    const { open, setOpen } = useBaseAccordionV2()

    const onPress = useCallback(() => {
        setOpen(!open)
    }, [open, setOpen])

    return (
        <Pressable style={[styles.header, style]} onPress={onPress}>
            {children}
        </Pressable>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
        },
    })
