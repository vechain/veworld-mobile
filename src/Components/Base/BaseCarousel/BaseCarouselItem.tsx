import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { Animated, ImageSourcePropType, ImageStyle, Linking, StyleSheet, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
type Props = {
    w?: number
    h?: number
    testID?: string
    href?: string
    source: ImageSourcePropType
    style?: ViewStyle
    imageStyle?: ImageStyle
    isExternalLink?: boolean
    onPress?: (name: string) => void
    /**
     * Decide when `onPress` is called. Default is `after
     */
    onPressActivation?: "before" | "after"
    name?: string
}

export const BaseCarouselItem: React.FC<Props> = ({
    source,
    href,
    style,
    imageStyle,
    testID,
    isExternalLink,
    w = SCREEN_WIDTH - 32,
    h = 128,
    onPress: propsOnPress,
    onPressActivation = "after",
    name,
}) => {
    const { styles } = useThemedStyles(baseStyles(w, h))
    const nav = useNavigation()

    const onPress = useCallback(async () => {
        if (!href) return
        if (isExternalLink) {
            if (onPressActivation === "before") propsOnPress?.(name ?? "")
            await Linking.openURL(href)
            if (onPressActivation === "after") propsOnPress?.(name ?? "")
        } else {
            if (onPressActivation === "before") propsOnPress?.(name ?? "")
            nav.navigate(Routes.BROWSER, { url: href })
            if (onPressActivation === "after") propsOnPress?.(name ?? "")
        }
    }, [href, isExternalLink, name, nav, onPressActivation, propsOnPress])

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
            marginLeft: 12,
        },
        image: {
            width: "100%",
            height: "100%",
        },
    })
