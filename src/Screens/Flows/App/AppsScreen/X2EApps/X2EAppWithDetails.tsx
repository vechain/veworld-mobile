import React, { PropsWithChildren, useState, useEffect, useCallback } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet, TouchableOpacity } from "react-native"
import Animated, {
    LinearTransition,
    useAnimatedStyle,
    withSpring,
    withTiming,
    Easing,
    useSharedValue,
    interpolate,
    interpolateColor,
} from "react-native-reanimated"
import { BaseIcon, BaseText } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { X2EAppDetails } from "./X2EAppDetails"

// Consistent animation timings for opening and closing
const ANIMATION_TIMING = {
    fontSizeChange: 400,
    labelTransition: 400,
    contentFadeDelay: 50, // Reduced from 150 to eliminate pause
    contentFade: 350,
    containerExpand: 400,
    containerCollapse: 400,
    paddingChange: 400,
    totalDuration: 450, // Reduced from 700 for snappier feel
}

// More coordinated easing - matches X2EAppDetails
const SMOOTH_EASING = Easing.bezier(0.25, 0.1, 0.25, 1)

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

export const X2EAppWithDetails = React.memo(
    ({ name, icon, desc, category = "Food & Drinks", children, isDefaultVisible = false }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const [loadFallback, setLoadFallback] = useState(false)
        const [showDetails, setShowDetails] = useState(isDefaultVisible)
        const [isAnimating, setIsAnimating] = useState(false)
        const [contentVisible, setContentVisible] = useState(isDefaultVisible)
        const [detailsLayoutReady, setDetailsLayoutReady] = useState(isDefaultVisible)

        // Used to prevent the flash on first open
        const [hasBeenOpenedBefore, setHasBeenOpenedBefore] = useState(isDefaultVisible)

        // Animation progress shared value (0 = closed, 1 = open)
        const animationProgress = useSharedValue(isDefaultVisible ? 1 : 0)
        // Press animation scale value
        const scale = useSharedValue(1)

        // Ensure details are visible if isDefaultVisible
        useEffect(() => {
            if (isDefaultVisible) {
                setDetailsLayoutReady(true)
                setHasBeenOpenedBefore(true)
            }
        }, [isDefaultVisible])

        const toggleDetails = useCallback(() => {
            if (isAnimating) return
            setIsAnimating(true)

            // Whether we're opening or closing
            const isOpening = !showDetails

            if (isOpening) {
                // Track that we've opened it at least once
                setHasBeenOpenedBefore(true)

                // Show container immediately but content will fade in
                setShowDetails(true)
                setDetailsLayoutReady(true) // Remove delay - set immediately

                // Start animation to value 1 (open) - no requestAnimationFrame delay
                animationProgress.value = withTiming(1, {
                    duration: ANIMATION_TIMING.totalDuration,
                    easing: SMOOTH_EASING,
                })

                // Show content with minimal delay for coordination
                setTimeout(() => {
                    setContentVisible(true)
                }, ANIMATION_TIMING.contentFadeDelay)

                // Animation is complete
                setTimeout(() => {
                    setIsAnimating(false)
                }, ANIMATION_TIMING.totalDuration)
            } else {
                // First fade out content
                setContentVisible(false)

                // Start animation to value 0 (closed)
                animationProgress.value = withTiming(0, {
                    duration: ANIMATION_TIMING.totalDuration,
                    easing: SMOOTH_EASING,
                })

                // Wait for animation to complete
                setTimeout(() => {
                    setDetailsLayoutReady(false)
                    setShowDetails(false)
                    setIsAnimating(false)
                }, ANIMATION_TIMING.totalDuration)
            }
        }, [isAnimating, showDetails, animationProgress])

        // Press handlers for scaling animation
        const onPressIn = useCallback(() => {
            scale.value = withSpring(0.97, { damping: 12, stiffness: 200 })
        }, [scale])

        const onPressOut = useCallback(() => {
            scale.value = withSpring(1, { damping: 12, stiffness: 200 })
        }, [scale])

        const onImageError = useCallback(() => {
            setLoadFallback(true)
        }, [])

        // Container style animation
        const containerStyle = useAnimatedStyle(() => {
            // Smooth color interpolation that transitions early in the animation (0 to 0.3)
            const backgroundColor = interpolateColor(
                animationProgress.value,
                [0, 0.3], // Transition happens in first 30% of animation - earlier and smoother
                [theme.colors.card, theme.colors.assetDetailsCard.background],
            )

            return {
                backgroundColor,
                borderRadius: interpolate(animationProgress.value, [0, 1], [0, 24]),
            }
        }, [theme])

        // Padding animation
        const padding = useAnimatedStyle(() => {
            return {
                paddingTop: interpolate(animationProgress.value, [0, 1], [0, 24]),
                paddingHorizontal: interpolate(animationProgress.value, [0, 1], [0, 24]),
                paddingBottom: interpolate(animationProgress.value, [0, 1], [0, 12]),
            }
        }, [])

        // Font size animated style
        const fontStyle = useAnimatedStyle(() => {
            // Interpolate font size between small (15) and large (17)
            const fontSize = interpolate(animationProgress.value, [0, 1], [15, 17])

            // Interpolate font weight between normal (500) and bold (600)
            const fontWeight = interpolate(animationProgress.value, [0, 1], [500, 600])

            return {
                fontSize,
                fontWeight: `${fontWeight}` as any,
            }
        })

        // Content animation
        const contentStyle = useAnimatedStyle(() => {
            return {
                opacity: contentVisible
                    ? withTiming(1, {
                          duration: ANIMATION_TIMING.contentFade,
                          easing: SMOOTH_EASING,
                      })
                    : withTiming(0, {
                          duration: ANIMATION_TIMING.contentFade,
                          easing: SMOOTH_EASING,
                      }),
                transform: [
                    {
                        scale: contentVisible
                            ? withTiming(1, {
                                  duration: ANIMATION_TIMING.contentFade,
                                  easing: SMOOTH_EASING,
                              })
                            : withTiming(0.97, {
                                  duration: ANIMATION_TIMING.contentFade,
                                  easing: SMOOTH_EASING,
                              }),
                    },
                ],
            }
        }, [contentVisible])

        // Description text animation style
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

        // Category label animation style
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

        // Press animation style
        const pressAnimationStyle = useAnimatedStyle(() => {
            return {
                transform: [{ scale: scale.value }],
            }
        })

        // Chevron animation
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

        return (
            <AnimatedBaseView
                flexDirection="column"
                // Use less bouncy animation parameters for layout transitions
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
                                <BaseIcon name="icon-chevron-down" size={16} color={theme.colors.label.text} />
                            </Animated.View>
                        </BaseView>
                        <AnimatedBaseView
                            flexDirection="row"
                            style={[padding]}
                            layout={LinearTransition.springify().damping(20).stiffness(100).mass(0.6)}>
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
                                    onError={onImageError}
                                    resizeMode="contain"
                                />
                                <BaseView
                                    flexDirection="column"
                                    gap={8}
                                    pr={16}
                                    overflow="hidden"
                                    flex={1}
                                    style={styles.textContainer}>
                                    <Animated.Text
                                        style={[styles.appNameText, fontStyle]}
                                        numberOfLines={1}
                                        testID="DAPP_WITH_DETAILS_NAME">
                                        {name}
                                    </Animated.Text>
                                    {showDetails ? (
                                        <Animated.View style={[contentStyle, categoryLabelStyle]}>
                                            <BaseView flexDirection="row">
                                                <BaseText
                                                    bg={theme.colors.label.backgroundLighter}
                                                    px={8}
                                                    py={4}
                                                    borderRadius={4}
                                                    typographyFont="captionMedium"
                                                    color={theme.colors.label.text}
                                                    testID="DAPP_WITH_DETAILS_CATEGORY">
                                                    {category}
                                                </BaseText>
                                            </BaseView>
                                        </Animated.View>
                                    ) : (
                                        <Animated.View style={descriptionStyle}>
                                            <BaseText
                                                typographyFont="captionRegular"
                                                numberOfLines={2}
                                                ellipsizeMode="tail"
                                                color={theme.colors.assetDetailsCard.text}
                                                w={100}
                                                testID="DAPP_WITH_DETAILS_DESC">
                                                {desc}
                                            </BaseText>
                                        </Animated.View>
                                    )}
                                </BaseView>
                            </BaseView>
                        </AnimatedBaseView>
                    </TouchableOpacity>
                </Animated.View>

                {/* Conditionally render the details component to avoid first-time layout calculation issues */}
                {(hasBeenOpenedBefore || showDetails) && (
                    <Animated.View>
                        <X2EAppDetails show={showDetails && detailsLayoutReady} visible={contentVisible}>
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
        textContainer: {
            zIndex: 1,
        },
        appNameText: {
            color: theme.colors.assetDetailsCard.title,
            fontFamily: "Inter-SemiBold",
        },
    })
