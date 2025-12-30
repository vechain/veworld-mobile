import React from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseView } from "./BaseView"

export type BaseBottomSheetHandleProps = {
    color: string
    style?: StyleProp<ViewStyle>
}

export const BaseBottomSheetHandle = ({ color, style }: BaseBottomSheetHandleProps) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseView style={[styles.wrapper, style]}>
            <BaseView style={[styles.handle, { backgroundColor: color }]} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        wrapper: {
            marginTop: 8,
            paddingTop: 8,
            paddingBottom: 16,
            paddingHorizontal: 8,
        },
        handle: {
            width: 70,
            height: 4,
            borderRadius: 8,
            backgroundColor: COLORS.GREY_300,
            alignSelf: "center",
        },
    })
