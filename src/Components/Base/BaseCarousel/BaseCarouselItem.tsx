import React, { useCallback } from "react"
import { Animated, ImageSourcePropType, ImageStyle, Linking, StyleSheet, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
type Props = {
    w?: number
    h?: number
    testID?: string
    href?: string
    source: ImageSourcePropType
    style?: ViewStyle
    imageStyle?: ImageStyle
    isExternalLink?: boolean
}

export const BaseCarouselItem: React.FC<Props> = ({
    source,
    href,
    style,
    imageStyle,
    testID,
    isExternalLink,
    w = 360,
    h = 128,
}) => {
    const { styles } = useThemedStyles(baseStyles(w, h))
    const nav = useNavigation()

    const onPress = useCallback(() => {
        if (href) {
            if (isExternalLink) {
                Linking.openURL(href)
            } else {
                nav.navigate(Routes.BROWSER, { url: href })
            }
        }
    }, [href, isExternalLink, nav])

    return (
        <Animated.View testID={testID} style={[style, styles.container]}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <Animated.Image
                    source={source}
                    resizeMode={"contain"}
                    style={[imageStyle, styles.image as ImageStyle]}
                />
            </TouchableOpacity>
        </Animated.View>
    )
}

const baseStyles = (w: number, h: number) => () =>
    StyleSheet.create({
        container: {
            flex: 1,
            width: w,
            height: h,
            marginLeft: 20,
        },
        image: {
            width: "100%",
            height: "100%",
        },
    })
