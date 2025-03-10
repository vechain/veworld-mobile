import { PlatformUtils } from "~Utils"
import { BlurView } from "./BlurView"
import { StyleSheet } from "react-native"
import React from "react"
import { BaseText, BaseView } from "~Components/Base"
import { LocalizedString } from "typesafe-i18n"
import { useTheme } from "~Hooks"

export const PlatformBlur = ({
    backgroundColor,
    blurAmount = 3,
    text,
    showTextOnIOS,
    paddingBottom = 0,
}: {
    backgroundColor: string
    blurAmount?: number
    text: LocalizedString
    showTextOnIOS?: boolean
    paddingBottom?: number
}) => {
    const theme = useTheme()

    if (PlatformUtils.isIOS()) {
        return (
            <BlurView style={[StyleSheet.absoluteFill]} blurAmount={blurAmount}>
                {showTextOnIOS && (
                    <BaseView flex={1} justifyContent="center" alignItems="center">
                        <BaseText color={theme.colors.text} typographyFont="captionMedium">
                            {text}
                        </BaseText>
                    </BaseView>
                )}
            </BlurView>
        )
    } else {
        return (
            <BaseView
                style={[StyleSheet.absoluteFill, baseStyles.androidBlurContainer, { backgroundColor, paddingBottom }]}>
                <BaseText typographyFont="subTitle">{text}</BaseText>
            </BaseView>
        )
    }
}

const baseStyles = StyleSheet.create({
    androidBlurContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
})
