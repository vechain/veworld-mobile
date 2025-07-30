import { PropsWithChildren, default as React, useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet, TouchableOpacity } from "react-native"
import Animated, { LinearTransition, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseIcon, BaseText } from "~Components"
import { BaseSpacer } from "~Components/Base/BaseSpacer"
import { BaseView } from "~Components/Base/BaseView"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { X2EAppDetails } from "./X2EAppDetails"

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))
const AnimatedBaseSpacer = Animated.createAnimatedComponent(wrapFunctionComponent(BaseSpacer))

type Props = PropsWithChildren<{
    name: string
    icon: string
    url: string
    /**
     * True if the details should be visible by default, false otherwise. Defaults to false
     */
    isDefaultVisible?: boolean
}>

export const X2EAppWithDetails = ({ name, icon, url, children, isDefaultVisible = false }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const [loadFallback, setLoadFallback] = useState(false)
    const [showDetails, setShowDetails] = useState(isDefaultVisible)

    const spacerStyles = useAnimatedStyle(() => {
        return {
            opacity: showDetails ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 300 }),
            height: showDetails ? 16 : 0,
        }
    }, [showDetails])

    const toggleDetails = () => {
        setShowDetails(prev => !prev)
    }

    return (
        <AnimatedBaseView flexDirection="column" layout={LinearTransition.duration(300)} borderRadius={12}>
            <TouchableOpacity activeOpacity={0.7} onPress={toggleDetails} testID="DAPP_WITH_DETAILS_ROW">
                <AnimatedBaseView flexDirection="row" gap={12} layout={LinearTransition.duration(300)}>
                    <BaseView flexDirection="row" gap={16} flex={1}>
                        <Image
                            source={
                                loadFallback
                                    ? require("~Assets/Img/dapp-fallback.png")
                                    : {
                                          uri: icon,
                                      }
                            }
                            style={[{ height: 48, width: 48 }, styles.icon] as StyleProp<ImageStyle>}
                            onError={() => setLoadFallback(true)}
                            resizeMode="contain"
                        />
                        <BaseView flexDirection="column" gap={2} flex={1}>
                            <BaseText
                                typographyFont="bodyMedium"
                                numberOfLines={1}
                                color={theme.colors.assetDetailsCard.title}
                                testID="DAPP_WITH_DETAILS_NAME">
                                {name}
                            </BaseText>
                            <BaseText
                                typographyFont="captionMedium"
                                numberOfLines={1}
                                color={theme.colors.assetDetailsCard.text}
                                testID="DAPP_WITH_DETAILS_URL">
                                {url}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                    <BaseView justifyContent="center">
                        <BaseIcon
                            name={showDetails ? "icon-chevron-up" : "icon-chevron-down"}
                            size={12}
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.PRIMARY_800}
                        />
                    </BaseView>
                </AnimatedBaseView>
            </TouchableOpacity>
            <AnimatedBaseSpacer style={[spacerStyles]} />
            <X2EAppDetails show={showDetails}>{children}</X2EAppDetails>
        </AnimatedBaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
    })
