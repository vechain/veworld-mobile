import React from "react"
import { StyleSheet } from "react-native"
import { BaseText, BaseView } from "~Components/Base"
import { useI18nContext } from "~i18n"

export const HideView = ({ background }: { background: string }) => {
    const { LL } = useI18nContext()

    console.log(LL)

    return (
        <BaseView
            style={[StyleSheet.absoluteFill, baseStyle.container]}
            bg={background}
            justifyContent="center"
            alignItems="center">
            <BaseText typographyFont="bodyAccent">{LL.TAP_TO_VIEW()}</BaseText>
        </BaseView>
    )
}

const baseStyle = StyleSheet.create({
    container: {
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
})
