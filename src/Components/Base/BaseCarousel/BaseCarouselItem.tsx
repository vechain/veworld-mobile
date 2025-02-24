import React, { useCallback } from "react"
import { Animated, ImageSourcePropType, ImageStyle, Linking, StyleSheet, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useThemedStyles } from "~Hooks"

type Props = {
    testID?: string
    href?: string
    source: ImageSourcePropType
    style?: ViewStyle
    imageStyle?: ImageStyle
}

export const BaseCarouselItem: React.FC<Props> = ({ source, href, style, imageStyle, testID }) => {
    const { styles } = useThemedStyles(baseStyles)

    const onPress = useCallback(() => {
        if (href) {
            Linking.openURL(href)
        }
    }, [href])

    return (
        <Animated.View testID={testID} style={[style, styles.container]}>
            <TouchableOpacity onPress={onPress}>
                <Animated.Image source={source} resizeMode="contain" style={[imageStyle, styles.image as ImageStyle]} />
            </TouchableOpacity>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        image: {
            width: "100%",
            height: "100%",
        },
    })
