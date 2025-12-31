import React from "react"
import { StyleSheet } from "react-native"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseView, BaseViewProps } from "./BaseView"

export type BaseBottomSheetHandleProps = BaseViewProps & {
    color: string
}

export const BaseBottomSheetHandle = ({ color, style, ...props }: BaseBottomSheetHandleProps) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseView style={[styles.wrapper, style]} {...props}>
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
