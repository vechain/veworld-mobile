import React, { PropsWithChildren } from "react"
import { StyleSheet } from "react-native"
import { BaseView, BaseViewProps } from "~Components/Base"

export type BaseAccountPfpProps = {
    size?: number
    borderRadius?: number
} & BaseViewProps

export const BaseAccountPfp = ({
    size = 50,
    borderRadius = 99,
    children,
    style,
    ...props
}: PropsWithChildren<BaseAccountPfpProps>) => {
    return (
        <BaseView borderRadius={borderRadius} style={[styles.view, { width: size, height: size }, style]} {...props}>
            {children}
        </BaseView>
    )
}

const styles = StyleSheet.create({
    view: { overflow: "hidden" },
})
