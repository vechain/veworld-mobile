import React from "react"
import { StyleSheet } from "react-native"
import { BaseText, BaseView } from "~Components/Base"
import { Fonts } from "~Model"
import { useI18nContext } from "~i18n"

export const HideView = ({ background }: { background: string }) => {
    const { LL } = useI18nContext()

    return (
        <BaseView
            style={[StyleSheet.absoluteFill, baseStyle.container]}
            background={background}
            justify="center"
            align="center">
            <BaseText font={Fonts.body_accent}>{LL.TAP_TO_VIEW()}</BaseText>
        </BaseView>
    )
}

const baseStyle = StyleSheet.create({
    container: {
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
})
