import { PlatformUtils } from "~Utils"
import { BlurView } from "./BlurView"
import { StyleSheet } from "react-native"
import React from "react"
import { BaseText, BaseView } from "~Components/Base"
import { LocalizedString } from "typesafe-i18n"

export const PlatformBlur = ({
    backgroundColor,
    blurAmount = 3,
    text,
    paddingBottom = 0,
    borderRadius = 8,
}: {
    backgroundColor: string
    blurAmount?: number
    text: LocalizedString
    paddingBottom?: number
    borderRadius?: number
}) => {
    if (PlatformUtils.isIOS()) {
        return <BlurView style={[StyleSheet.absoluteFill, { borderRadius }]} blurAmount={blurAmount} />
    } else {
        return (
            <>
                <BaseView
                    style={[
                        StyleSheet.absoluteFill,
                        baseStyles.androidBlurContainer,
                        { backgroundColor, paddingBottom, borderRadius },
                    ]}>
                    <BaseText typographyFont="subTitle">{text}</BaseText>
                </BaseView>
            </>
        )
    }
}

const baseStyles = StyleSheet.create({
    androidBlurContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
})
