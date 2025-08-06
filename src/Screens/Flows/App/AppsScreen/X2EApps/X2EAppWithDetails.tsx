import React, { useState, useCallback, PropsWithChildren } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet, TouchableOpacity } from "react-native"
import Animated, {
    LinearTransition,
    useAnimatedStyle,
    withSpring,
    withTiming,
    useSharedValue,
    interpolate,
    interpolateColor,
} from "react-native-reanimated"
import { BaseIcon, BaseSpacer, BaseText } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { X2EAppDetails } from "./X2EAppDetails"
import { ANIMATION_TIMING, SMOOTH_EASING, PRESS_SPRING_CONFIG, CONTENT_TIMING_CONFIG } from "./AnimationConstants"

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

type X2EAppWithDetailsProps = PropsWithChildren<{
    name: string
    icon: string
    desc?: string
    categories?: string[]
    isDefaultVisible?: boolean
    isFavorite?: boolean
    onToggleFavorite?: () => void
}>

export const X2EAppWithDetails = React.memo(
    ({
        name,
        icon,
        desc,
        categories = [],
        children,
        isDefaultVisible = false,
        isFavorite = false,
        onToggleFavorite,
    }: X2EAppWithDetailsProps) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const [loadFallback, setLoadFallback] = useState(false)
        const [showDetails, setShowDetails] = useState(isDefaultVisible)
        const [isAnimating, setIsAnimating] = useState(false)
        const [contentVisible, setContentVisible] = useState(isDefaultVisible)

        const animationProgress = useSharedValue(isDefaultVisible ? 1 : 0)
        const scale = useSharedValue(1)

        const toggleDetails = useCallback(() => {
            if (isAnimating) return
            setIsAnimating(true)

            const isOpening = !showDetails

            if (isOpening) {
                setShowDetails(true)

                animationProgress.value = withTiming(1, {
                    duration: ANIMATION_TIMING.totalDuration,
                    easing: SMOOTH_EASING,
                })

                setTimeout(() => {
                    setContentVisible(true)
                }, ANIMATION_TIMING.contentFadeDelay)

                setTimeout(() => {
                    setIsAnimating(false)
                }, ANIMATION_TIMING.totalDuration)
            } else {
                setContentVisible(false)

                animationProgress.value = withTiming(0, {
                    duration: ANIMATION_TIMING.totalDuration,
                    easing: SMOOTH_EASING,
                })

                setTimeout(() => {
                    setShowDetails(false)
                    setIsAnimating(false)
                }, ANIMATION_TIMING.totalDuration)
            }
        }, [isAnimating, showDetails, animationProgress])

        const onPressIn = useCallback(() => {
            scale.value = withSpring(0.97, PRESS_SPRING_CONFIG)
        }, [scale])

        const onPressOut = useCallback(() => {
            scale.value = withSpring(1, PRESS_SPRING_CONFIG)
        }, [scale])

        const onImageError = useCallback(() => {
            setLoadFallback(true)
        }, [])

        const containerStyle = useAnimatedStyle(() => {
            const backgroundColor = interpolateColor(
                animationProgress.value,
                [0, 1],
                [theme.colors.transparent, theme.colors.x2eAppOpenDetails.background],
            )

            return {
                backgroundColor,
                borderRadius: interpolate(animationProgress.value, [0, 1], [10, 24]),
                borderWidth: interpolate(animationProgress.value, [0, 1], [0, 1]),
                borderColor: theme.colors.x2eAppOpenDetails.border,
            }
        }, [theme])

        const padding = useAnimatedStyle(() => {
            return {
                paddingTop: interpolate(animationProgress.value, [0, 1], [0, 24]),
                paddingHorizontal: interpolate(animationProgress.value, [0, 1], [0, 24]),
                paddingBottom: interpolate(animationProgress.value, [0, 1], [0, 12]),
            }
        }, [])

        const fontStyle = useAnimatedStyle(() => {
            const fontSize = interpolate(animationProgress.value, [0, 1], [15, 17])

            const fontWeight = interpolate(animationProgress.value, [0, 1], [500, 600])

            return {
                fontSize,
                fontWeight: `${fontWeight}` as any,
            }
        })

        const contentStyle = useAnimatedStyle(() => {
            return {
                opacity: contentVisible ? withTiming(1, CONTENT_TIMING_CONFIG) : withTiming(0, CONTENT_TIMING_CONFIG),
                transform: [
                    {
                        scale: contentVisible
                            ? withTiming(1, CONTENT_TIMING_CONFIG)
                            : withTiming(0.97, CONTENT_TIMING_CONFIG),
                    },
                ],
            }
        }, [contentVisible])

        const descriptionStyle = useAnimatedStyle(() => {
            return {
                opacity: interpolate(animationProgress.value, [0, 0.3], [1, 0]),
                transform: [
                    {
                        translateY: interpolate(animationProgress.value, [0, 0.3], [0, -10]),
                    },
                ],
            }
        })

        const categoryLabelStyle = useAnimatedStyle(() => {
            return {
                opacity: interpolate(animationProgress.value, [0.7, 1], [0, 1]),
                transform: [
                    {
                        translateY: interpolate(animationProgress.value, [0.7, 1], [10, 0]),
                    },
                ],
            }
        })

        const pressAnimationStyle = useAnimatedStyle(() => {
            return {
                transform: [{ scale: scale.value }],
            }
        })

        const chevronStyle = useAnimatedStyle(() => {
            return {
                opacity: interpolate(animationProgress.value, [0.1, 0.7], [0, 1]),
                transform: [
                    {
                        rotate: `${interpolate(animationProgress.value, [0, 1], [-180, 0])}deg`,
                    },
                ],
            }
        })

        const spacerStyle = useAnimatedStyle(() => {
            return {
                width: interpolate(animationProgress.value, [0, 1], [24, 16]),
            }
        })

        return (
            <AnimatedBaseView
                flexDirection="column"
                layout={LinearTransition.springify().damping(20).stiffness(100).mass(0.6)}
                style={[styles.mainContainer, containerStyle]}>
                <Animated.View style={pressAnimationStyle}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={toggleDetails}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        disabled={isAnimating}
                        testID="X2E_APP_WITH_DETAILS_ROW">
                        <BaseView justifyContent="center">
                            <Animated.View style={[styles.chevron, chevronStyle]}>
                                <BaseIcon
                                    name="icon-chevron-down"
                                    size={16}
                                    color={theme.colors.x2eAppOpenDetails.chevron.icon}
                                />
                            </Animated.View>
                        </BaseView>
                        <AnimatedBaseView
                            flexDirection="row"
                            mb={4}
                            style={[padding]}
                            layout={LinearTransition.springify().damping(20).stiffness(100).mass(0.6)}>
                            <BaseView flexDirection="row" flex={1} alignItems="flex-start">
                                <Image
                                    source={
                                        loadFallback
                                            ? require("~Assets/Img/dapp-fallback.png")
                                            : {
                                                  uri: icon,
                                              }
                                    }
                                    style={[{ height: 64, width: 64 }, styles.icon] as StyleProp<ImageStyle>}
                                    onError={onImageError}
                                    resizeMode="contain"
                                />
                                <Animated.View style={spacerStyle} />
                                <BaseView flexDirection="column" gap={10} pr={16} overflow="hidden" flex={1}>
                                    <Animated.Text
                                        style={[styles.appNameText, fontStyle]}
                                        numberOfLines={1}
                                        testID="X2E_APP_WITH_DETAILS_NAME">
                                        {name}
                                    </Animated.Text>

                                    {showDetails ? (
                                        <Animated.View style={[contentStyle, categoryLabelStyle]}>
                                            <BaseView flexDirection="row" flexWrap="wrap" gap={8}>
                                                {categories.map((category, index) => (
                                                    <BaseText
                                                        key={category}
                                                        bg={theme.colors.x2eAppOpenDetails.label.background}
                                                        px={8}
                                                        py={4}
                                                        borderRadius={4}
                                                        typographyFont="captionMedium"
                                                        color={theme.colors.x2eAppOpenDetails.label.text}
                                                        testID={`DAPP_WITH_DETAILS_CATEGORY_${index}`}>
                                                        {category}
                                                    </BaseText>
                                                ))}
                                            </BaseView>
                                        </Animated.View>
                                    ) : (
                                        <Animated.View style={descriptionStyle}>
                                            <BaseText
                                                typographyFont="captionRegular"
                                                numberOfLines={2}
                                                ellipsizeMode="tail"
                                                color={theme.colors.x2eAppOpenDetails.description}
                                                w={100}
                                                testID="DAPP_WITH_DETAILS_DESC">
                                                {desc}
                                            </BaseText>
                                        </Animated.View>
                                    )}
                                </BaseView>
                                <BaseSpacer width={12} />
                            </BaseView>
                            {!showDetails && (
                                <TouchableOpacity onPress={onToggleFavorite} style={styles.iconWrapper}>
                                    <BaseIcon
                                        name={isFavorite ? "icon-star-on" : "icon-star"}
                                        haptics="Light"
                                        size={20}
                                        color={theme.colors.x2eAppOpenDetails.description}
                                    />
                                </TouchableOpacity>
                            )}
                        </AnimatedBaseView>
                    </TouchableOpacity>
                </Animated.View>

                {showDetails && (
                    <Animated.View>
                        <X2EAppDetails show={showDetails} visible={contentVisible}>
                            {children}
                        </X2EAppDetails>
                    </Animated.View>
                )}
            </AnimatedBaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        mainContainer: {
            backgroundColor: theme.colors.x2eAppOpenDetails.background,
            transformOrigin: "center",
            overflow: "hidden",
        },
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
        iconWrapper: {
            padding: 10,
        },
        chevron: {
            position: "absolute",
            right: 14,
            top: 14,
            borderRadius: 99,
            padding: 8,
            backgroundColor: theme.colors.x2eAppOpenDetails.chevron.background,
        },
        appNameText: {
            color: theme.colors.x2eAppOpenDetails.title,
            fontFamily: "Inter-SemiBold",
        },
    })
