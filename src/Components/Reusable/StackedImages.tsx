import React from "react"
import { PixelRatio, StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { Extrapolation, interpolate } from "react-native-reanimated"
import { BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

const StackedImage = ({ imageUri, index }: { imageUri: string; index: number }) => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <FastImage
            source={{ uri: imageUri }}
            style={[
                styles.container as ImageStyle,
                {
                    zIndex: index,
                },
            ]}
        />
    )
}

type Props = {
    uris: string[]
    /**
     * Define the maximum amount of images shown before showing (+ <remaining>)
     * @default 3
     */
    maxImagesBeforeCompression?: number
}

export const StackedImages = ({ uris, maxImagesBeforeCompression = 3 }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseView flexDirection="row">
            {uris.slice(0, maxImagesBeforeCompression).map((uri, index) => (
                <StackedImage imageUri={uri} key={uri} index={index} />
            ))}
            {uris.length > maxImagesBeforeCompression && (
                <BaseView style={[styles.container, styles.numberContainer]}>
                    <BaseText
                        typographyFont="smallCaptionSemiBold"
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}
                        flexDirection="row">
                        +{uris.length - maxImagesBeforeCompression}
                    </BaseText>
                </BaseView>
            )}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: 24 * interpolate(PixelRatio.getFontScale(), [1, 2], [1, 1.5], Extrapolation.CLAMP),
            height: 24 * interpolate(PixelRatio.getFontScale(), [1, 2], [1, 1.5], Extrapolation.CLAMP),
            marginLeft: -4,
            borderRadius: 99,
        },
        numberContainer: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_100,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
        },
    })
