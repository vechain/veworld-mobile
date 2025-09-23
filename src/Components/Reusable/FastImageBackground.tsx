import React, { useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import FastImage, { FastImageProps, ImageStyle } from "react-native-fast-image"

type Props = Omit<FastImageProps, "style"> & {
    style?: StyleProp<ViewStyle>
    imageStyle?: StyleProp<ImageStyle>
}

/**
 * Alternative to ImageBackground that uses {@link FastImage} instead of a RN `Image` component.
 * The code was taken directly from the RN repository and adapted to the library
 * @param param0 Props
 * @returns a component that can be used in place of ImageBackground
 */
export const FastImageBackground = ({ children, style, imageStyle, importantForAccessibility, ...props }: Props) => {
    const flattenedStyle = useMemo(() => {
        return StyleSheet.flatten(style)
    }, [style])

    return (
        <View
            accessibilityIgnoresInvertColors={true}
            importantForAccessibility={importantForAccessibility}
            style={style}>
            <FastImage
                {...props}
                importantForAccessibility={importantForAccessibility}
                style={[
                    StyleSheet.absoluteFill,
                    {
                        width: flattenedStyle?.width,
                        height: flattenedStyle?.height,
                    },
                    imageStyle,
                ]}
            />
            {children}
        </View>
    )
}
