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

const ANIMATION_TIMING = {
    fontSizeChange: 400,
    labelTransition: 400,
    contentFadeDelay: 50,
    contentFade: 350,
    containerExpand: 400,
    containerCollapse: 400,
    paddingChange: 400,
    totalDuration: 450,
}

const SMOOTH_EASING = Easing.bezier(0.25, 0.1, 0.25, 1)

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

type Props = PropsWithChildren<{
    name: string
    icon: string
    desc?: string
    categories?: string[]
    url?: string
    isDefaultVisible?: boolean
}>

export const X2EAppWithDetails = React.memo(
    ({ name, icon, desc, categories = [], children, isDefaultVisible = false }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const [loadFallback, setLoadFallback] = useState(false)
        const [showDetails, setShowDetails] = useState(isDefaultVisible)
        const [isAnimating, setIsAnimating] = useState(false)
        const [contentVisible, setContentVisible] = useState(isDefaultVisible)
        const [detailsLayoutReady, setDetailsLayoutReady] = useState(isDefaultVisible)

        const [hasBeenOpenedBefore, setHasBeenOpenedBefore] = useState(isDefaultVisible)

        const animationProgress = useSharedValue(isDefaultVisible ? 1 : 0)
        const scale = useSharedValue(1)

        useEffect(() => {
            if (isDefaultVisible) {
                setDetailsLayoutReady(true)
                setHasBeenOpenedBefore(true)
            }
        }, [isDefaultVisible])

        const toggleDetails = useCallback(() => {
            if (isAnimating) return
            setIsAnimating(true)

            const isOpening = !showDetails

            if (isOpening) {
                setHasBeenOpenedBefore(true)

                setShowDetails(true)
                setDetailsLayoutReady(true)

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
                    setDetailsLayoutReady(false)
                    setShowDetails(false)
                    setIsAnimating(false)
                }, ANIMATION_TIMING.totalDuration)
            }
        }, [isAnimating, showDetails, animationProgress])

        const onPressIn = useCallback(() => {
            scale.value = withSpring(0.97, { damping: 12, stiffness: 200 })
        }, [scale])

        const onPressOut = useCallback(() => {
            scale.value = withSpring(1, { damping: 12, stiffness: 200 })
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
                                            <BaseView flexDirection="row" flexWrap="wrap" gap={8}>
                                                {categories.map((category, index) => (
                                                    <BaseText
                                                        key={index}
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
                            </BaseView>
                        </AnimatedBaseView>
                    </TouchableOpacity>
                </Animated.View>

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
            backgroundColor: theme.colors.x2eAppOpenDetails.background,
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
            backgroundColor: theme.colors.x2eAppOpenDetails.chevron.background,
        },
        textContainer: {
            zIndex: 1,
        },
        appNameText: {
            color: theme.colors.x2eAppOpenDetails.title,
            fontFamily: "Inter-SemiBold",
        },
    })
