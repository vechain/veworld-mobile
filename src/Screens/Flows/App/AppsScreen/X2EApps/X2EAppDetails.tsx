import React, { PropsWithChildren, useState, useEffect, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, {
    LinearTransition,
    useAnimatedStyle,
    withTiming,
    Easing,
    withDelay,
    withSequence,
} from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseSpacer, BaseText } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"

const TIMING_CONFIG = {
    duration: 350, // Increased slightly for smoother feel
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}

// No bounce layout transition for smoother closing
const SMOOTH_LAYOUT = LinearTransition.springify().damping(20).stiffness(100).mass(0.6)

// Smooth ease-out bezier curve for dynamic closing
const SMOOTH_OUT_EASING = Easing.bezier(0.22, 1, 0.36, 1)

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

const Title = React.memo(({ children }: PropsWithChildren) => {
    const theme = useTheme()
    return (
        <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.assetDetailsCard.title}>
            {children}
        </BaseText>
    )
})

interface StatItemProps {
    value: string
    label: string
    delay?: number
}

// Base animation durations and delays - reduced for smoother flow
const BASE_ENTRY_DELAY = 60 // Reduced from 100
const ENTRY_DELAY_INCREMENT = 50 // Reduced from 80

const Description = React.memo(({ children }: { children: string }) => {
    const theme = useTheme()

    const descriptionStyle = useAnimatedStyle(
        () => ({
            opacity: withDelay(BASE_ENTRY_DELAY, withTiming(1, TIMING_CONFIG)),
            transform: [
                { translateY: withDelay(BASE_ENTRY_DELAY, withTiming(0, TIMING_CONFIG)) },
                { scale: withDelay(BASE_ENTRY_DELAY, withTiming(1, TIMING_CONFIG)) },
            ],
        }),
        [],
    )

    return (
        <AnimatedBaseView layout={SMOOTH_LAYOUT} flexDirection="row" gap={8} alignItems="flex-start">
            <Animated.View style={[styles.sequentialRevealState, descriptionStyle]}>
                <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600} typographyFont="body">
                    {children}
                </BaseText>
            </Animated.View>
        </AnimatedBaseView>
    )
})

// Separate component for each stat item that safely uses hooks
const StatItem = React.memo(({ value, label, delay = 0 }: StatItemProps) => {
    // Calculate total delay including the Stats component base delay
    const totalDelay = BASE_ENTRY_DELAY + ENTRY_DELAY_INCREMENT + delay

    const animatedStyle = useAnimatedStyle(
        () => ({
            opacity: withDelay(totalDelay, withTiming(1, TIMING_CONFIG)),
            transform: [
                { translateY: withDelay(totalDelay, withTiming(0, TIMING_CONFIG)) },
                { scale: withDelay(totalDelay, withTiming(1, TIMING_CONFIG)) },
            ],
        }),
        [totalDelay],
    )

    return (
        <Animated.View style={[styles.sequentialRevealState, animatedStyle]}>
            <BaseView flexDirection="column" gap={2}>
                <BaseText typographyFont={"subSubTitleSemiBold"}>{value}</BaseText>
                <BaseText typographyFont={"captionMedium"}>{label}</BaseText>
            </BaseView>
        </Animated.View>
    )
})

interface StatsProps {
    rating?: StatItemProps
    users?: StatItemProps
    co2Saved?: StatItemProps
    customStats?: StatItemProps[]
}

const Stats = React.memo(
    ({
        rating = { value: "4.5", label: "Rating" },
        users = { value: "1.1M", label: "Users" },
        co2Saved = { value: "10.8 T", label: "CO2 saved" },
        customStats = [],
    }: StatsProps) => {
        return (
            <AnimatedBaseView
                layout={SMOOTH_LAYOUT}
                flexDirection={"row"}
                justifyContent={"space-between"}
                py={4}
                px={8}
                gap={8}>
                {rating && <StatItem value={rating.value} label={rating.label} delay={0} />}
                {users && <StatItem value={users.value} label={users.label} delay={25} />}
                {co2Saved && <StatItem value={co2Saved.value} label={co2Saved.label} delay={50} />}
                {customStats.map((stat, index) => (
                    <StatItem key={index} value={stat.value} label={stat.label} delay={75 + index * 25} />
                ))}
            </AnimatedBaseView>
        )
    },
)

interface ActionsProps {
    onAddToFavorites?: () => void
    onOpen?: () => void
    isFavorite?: boolean
    openButtonText?: string
    favoriteButtonText?: string
}

const Actions = React.memo(
    ({
        onAddToFavorites = () => {},
        onOpen = () => {},
        isFavorite = false,
        openButtonText,
        favoriteButtonText,
    }: ActionsProps) => {
        const { LL } = useI18nContext()

        // Calculate total delay for buttons to appear after description and stats - reduced
        const actionsBaseDelay = BASE_ENTRY_DELAY + ENTRY_DELAY_INCREMENT * 1.5 // Reduced multiplier

        const favoriteButtonStyle = useAnimatedStyle(
            () => ({
                opacity: withDelay(actionsBaseDelay, withTiming(1, TIMING_CONFIG)),
                transform: [
                    { translateY: withDelay(actionsBaseDelay, withTiming(0, TIMING_CONFIG)) },
                    { scale: withDelay(actionsBaseDelay, withTiming(1, TIMING_CONFIG)) },
                ],
            }),
            [],
        )

        const openButtonStyle = useAnimatedStyle(
            () => ({
                opacity: withDelay(actionsBaseDelay + 30, withTiming(1, TIMING_CONFIG)), // Reduced from 50
                transform: [
                    { translateY: withDelay(actionsBaseDelay + 30, withTiming(0, TIMING_CONFIG)) },
                    { scale: withDelay(actionsBaseDelay + 30, withTiming(1, TIMING_CONFIG)) },
                ],
            }),
            [],
        )

        return (
            <AnimatedBaseView layout={SMOOTH_LAYOUT} flexDirection="column" gap={16} px={0}>
                <Animated.View style={[styles.sequentialRevealState, favoriteButtonStyle]}>
                    <BaseButton variant="outline" action={onAddToFavorites}>
                        <BaseView flexDirection="row" alignItems="center">
                            <BaseIcon name={"icon-star"} size={16} />
                            <BaseSpacer width={12} />
                            <BaseText typographyFont="bodyMedium">
                                {favoriteButtonText ||
                                    (isFavorite ? LL.BTN_REMOVE_FROM_FAVORITES?.() : LL.BTN_ADD_TO_FAVORITES?.())}
                            </BaseText>
                        </BaseView>
                    </BaseButton>
                </Animated.View>

                <Animated.View style={[styles.sequentialRevealState, openButtonStyle]}>
                    <BaseButton action={onOpen}>{openButtonText || LL.BTN_OPEN()}</BaseButton>
                </Animated.View>
            </AnimatedBaseView>
        )
    },
)

const Container = React.memo(({ children }: PropsWithChildren) => {
    return (
        <AnimatedBaseView layout={SMOOTH_LAYOUT} flexDirection="column" gap={8} px={24} pb={24}>
            {children}
        </AnimatedBaseView>
    )
})

// Sequential animation section wrapper that waits for previous section to complete
const SequentialSection = ({
    children,
    index,
    isVisible,
    onAnimationComplete,
}: {
    children: React.ReactNode
    index: number
    isVisible: boolean
    onAnimationComplete?: () => void
}) => {
    // Reduced delays for smoother flow
    const animationDelay = index === 0 ? 40 : 60 // Reduced from 80/100
    const animationDuration = 300 // Increased from 250 for smoother motion

    const [isContentVisible, setIsContentVisible] = useState(false)

    // Only start showing content when our turn comes
    useEffect(() => {
        if (isVisible) {
            // Add delay based on section index
            const timer = setTimeout(() => {
                setIsContentVisible(true)

                // Notify that this section's animation is complete
                const completeTimer = setTimeout(() => {
                    onAnimationComplete?.()
                }, animationDuration)

                return () => clearTimeout(completeTimer)
            }, animationDelay)

            return () => clearTimeout(timer)
        } else {
            setIsContentVisible(false)
        }
    }, [isVisible, animationDelay, onAnimationComplete, animationDuration])

    // Animation style for this section
    const sectionStyle = useAnimatedStyle(() => {
        return {
            opacity: isContentVisible
                ? withTiming(1, { duration: animationDuration, easing: Easing.out(Easing.ease) })
                : 0,
            transform: [
                {
                    translateY: isContentVisible
                        ? withTiming(0, { duration: animationDuration, easing: Easing.out(Easing.ease) })
                        : 8,
                },
                {
                    scale: isContentVisible
                        ? withTiming(1, { duration: animationDuration, easing: Easing.out(Easing.ease) })
                        : 0.98,
                },
            ],
        }
    }, [isContentVisible])

    // Don't render until it's this section's turn
    if (!isVisible) return null

    return <Animated.View style={[sectionStyle]}>{children}</Animated.View>
}

type Props = PropsWithChildren<{
    show: boolean
    visible?: boolean
}>

const X2EAppDetails = ({ children, show, visible = show }: Props) => {
    const shouldShow = show && visible

    // Track whether this is the first time opening
    const [hasShownBefore, setHasShownBefore] = useState(false)

    // Control sequential section animations
    const [sectionProgress, setSectionProgress] = useState(0)

    // Reset animation sequence when visibility changes
    useEffect(() => {
        if (shouldShow) {
            setSectionProgress(0)
            if (!hasShownBefore) {
                setHasShownBefore(true)
            }
        } else {
            // Reset progress when closing - we'll fade everything out together
            setSectionProgress(-1)
        }
    }, [shouldShow, hasShownBefore])

    // Handle section completion - advance to next section
    const handleSectionComplete = useCallback(
        (currentIndex: number) => {
            // Only advance when showing
            if (shouldShow) {
                setSectionProgress(prev => Math.max(prev, currentIndex + 1))
            }
        },
        [shouldShow],
    )

    // Memoize children mapping to prevent unnecessary re-renders
    const memoizedChildren = useMemo(
        () =>
            React.Children.map(children, (child, index) => (
                <SequentialSection
                    key={index}
                    index={index}
                    isVisible={(shouldShow && index <= sectionProgress) || (!shouldShow && show)}
                    onAnimationComplete={() => handleSectionComplete(index)}>
                    {child}
                </SequentialSection>
            )),
        [children, shouldShow, sectionProgress, show, handleSectionComplete],
    )

    // Better animation style to avoid both autoNaN issues and flashing gaps
    const animatedStyles = useAnimatedStyle(() => {
        // Opacity animation with proper sequence
        const opacity = shouldShow
            ? withTiming(1, TIMING_CONFIG)
            : withSequence(
                  withTiming(1, { duration: 50, easing: Easing.linear }),
                  withTiming(0, { duration: 200, easing: SMOOTH_OUT_EASING }),
              )

        // Use maxHeight for a more stable animation that won't cause layout jumps
        return {
            opacity,
            maxHeight: shouldShow ? 1000 : 0, // Fixed height eliminates the calculation issues
            overflow: "hidden",
        }
    }, [shouldShow])

    return (
        <AnimatedBaseView
            layout={SMOOTH_LAYOUT}
            style={[styles.detailsContainer, animatedStyles]}
            flexDirection="column">
            {memoizedChildren}
        </AnimatedBaseView>
    )
}

X2EAppDetails.Title = Title
X2EAppDetails.Description = Description
X2EAppDetails.Stats = Stats
X2EAppDetails.Actions = Actions
X2EAppDetails.Container = Container

export { X2EAppDetails }

const styles = StyleSheet.create({
    detailsContainer: {
        gap: 12,
    },
    button: {
        borderRadius: 99,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
    },
    initialAnimationState: {
        opacity: 0,
        transform: [{ translateY: 10 }],
    },
    sequentialRevealState: {
        opacity: 0,
        transform: [
            { translateY: 8 }, // Start slightly above final position
            { scale: 0.95 }, // Slightly smaller scale for a subtle "pop" effect
        ],
    },
})
