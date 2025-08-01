import { PropsWithChildren, default as React, useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet, TouchableOpacity } from "react-native"
import Animated, {
    LinearTransition,
    useAnimatedStyle,
    withSpring,
    withTiming,
    Easing,
    withSequence,
    withDelay,
} from "react-native-reanimated"
import { BaseIcon, BaseText } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { X2EAppDetails } from "./X2EAppDetails"

// Animation configurations
const SPRING_CONFIG = {
    damping: 12,
    stiffness: 90,
    mass: 0.6,
    overshootClamping: false,
    restSpeedThreshold: 0.3,
    restDisplacementThreshold: 0.3,
}

const TIMING_CONFIG = {
    duration: 250,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}

const CLOSING_TIMING = {
    duration: 200,
    easing: Easing.bezier(0.42, 0, 1, 1), // Ease-out for closing
}

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

type Props = PropsWithChildren<{
    name: string
    icon: string
    desc?: string
    category?: string
    /**
     * True if the details should be visible by default, false otherwise. Defaults to false
     */
    isDefaultVisible?: boolean
}>

export const X2EAppWithDetails = ({
    name,
    icon,
    desc,
    category = "Food & Drinks",
    children,
    isDefaultVisible = false,
}: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const [loadFallback, setLoadFallback] = useState(false)
    const [showDetails, setShowDetails] = useState(isDefaultVisible)
    const [isAnimating, setIsAnimating] = useState(false)
    const [contentVisible, setContentVisible] = useState(isDefaultVisible)

    const toggleDetails = () => {
        if (isAnimating) return
        setIsAnimating(true)

        // Toggle the details state
        if (!showDetails) {
            // Opening
            setShowDetails(true)
            // Delay content visibility until container starts expanding
            setTimeout(() => setContentVisible(true), 50)
            setTimeout(() => setIsAnimating(false), 400)
        } else {
            // Closing - hide content first, then collapse
            setContentVisible(false)
            setTimeout(() => {
                setShowDetails(false)
                setIsAnimating(false)
            }, 200)
        }
    }

    const containerStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: showDetails
                ? withTiming(theme.colors.assetDetailsCard.background, TIMING_CONFIG)
                : withTiming(theme.colors.card, CLOSING_TIMING),
            borderRadius: showDetails
                ? withSequence(
                      // Quick start with small movement
                      withTiming(8, { duration: 80, easing: Easing.ease }),
                      // Complete the animation with a spring for natural feel
                      withSpring(24, SPRING_CONFIG),
                  )
                : withTiming(0, CLOSING_TIMING),
        }
    }, [showDetails])

    const contentStyle = useAnimatedStyle(() => {
        return {
            opacity: contentVisible
                ? withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) })
                : withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) }),
            transform: [
                {
                    scale: contentVisible
                        ? withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) })
                        : withTiming(0.95, { duration: 150, easing: Easing.in(Easing.ease) }),
                },
            ],
        }
    }, [contentVisible])

    const padding = useAnimatedStyle(() => {
        return {
            padding: showDetails
                ? withDelay(50, withTiming(24, { duration: 200, easing: Easing.out(Easing.ease) }))
                : withTiming(0, { duration: 100, easing: Easing.in(Easing.ease) }),
        }
    }, [showDetails])

    return (
        <AnimatedBaseView
            flexDirection="column"
            layout={LinearTransition.springify().damping(12).stiffness(100).mass(0.8)}
            style={[styles.mainContainer, containerStyle]}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleDetails}
                disabled={isAnimating}
                testID="X2E_APP_WITH_DETAILS_ROW">
                <BaseView justifyContent="center">
                    {showDetails && (
                        <BaseView style={styles.chevron}>
                            <BaseIcon name="icon-chevron-up" size={16} color={theme.colors.label.text} />
                        </BaseView>
                    )}
                </BaseView>
                <AnimatedBaseView
                    flexDirection="row"
                    style={[padding]}
                    layout={LinearTransition.springify().damping(12).stiffness(100).mass(0.8)}>
                    <BaseView flexDirection="row" gap={24} flex={1}>
                        <Image
                            source={
                                loadFallback
                                    ? require("~Assets/Img/dapp-fallback.png")
                                    : {
                                          uri: icon,
                                      }
                            }
                            style={[{ height: 64, width: 64 }, styles.icon] as StyleProp<ImageStyle>}
                            onError={() => setLoadFallback(true)}
                            resizeMode="contain"
                        />
                        <BaseView flexDirection="column" gap={4} pr={100} overflow="hidden">
                            <BaseText
                                typographyFont={showDetails ? "subTitleSemiBold" : "subSubTitleSemiBold"}
                                numberOfLines={1}
                                color={theme.colors.assetDetailsCard.title}
                                testID="DAPP_WITH_DETAILS_NAME">
                                {name}
                            </BaseText>
                            {showDetails ? (
                                <Animated.View style={contentStyle}>
                                    <BaseText
                                        bg={theme.colors.label.backgroundLighter}
                                        px={8}
                                        py={4}
                                        borderRadius={4}
                                        typographyFont="captionMedium"
                                        color={theme.colors.label.text}
                                        testID="DAPP_WITH_DETAILS_URL">
                                        {category}
                                    </BaseText>
                                </Animated.View>
                            ) : (
                                <BaseText
                                    typographyFont="captionRegular"
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                    pr={24}
                                    color={theme.colors.assetDetailsCard.text}
                                    testID="DAPP_WITH_DETAILS_URL">
                                    {desc}
                                </BaseText>
                            )}
                        </BaseView>
                    </BaseView>
                </AnimatedBaseView>
            </TouchableOpacity>
            <X2EAppDetails show={showDetails} visible={contentVisible}>
                {children}
            </X2EAppDetails>
        </AnimatedBaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        mainContainer: {
            backgroundColor: theme.colors.editSpeedBs.result.background,
            transformOrigin: "center",
            overflow: "hidden",
        },
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
        chevron: {
            position: "absolute",
            right: 14,
            top: 14,
            borderRadius: 99,
            padding: 8,
            backgroundColor: theme.colors.label.background,
        },
    })
