import React, { PropsWithChildren } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition, useAnimatedStyle, withTiming, Easing, withDelay } from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseSpacer, BaseText } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"

const TIMING_CONFIG = {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}

const CLOSING_TIMING = {
    duration: 200,
    easing: Easing.bezier(0.42, 0, 1, 1), // Ease-out for closing
}

// No bounce layout transition for smoother closing
const SMOOTH_LAYOUT = LinearTransition.springify().damping(20).stiffness(100).mass(0.6)

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

const Title = ({ children }: PropsWithChildren) => {
    const theme = useTheme()
    return (
        <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.assetDetailsCard.title}>
            {children}
        </BaseText>
    )
}

interface StatItemProps {
    value: string
    label: string
    delay?: number
}

// Separate component for each stat item that safely uses hooks
const StatItem = ({ value, label, delay = 0 }: StatItemProps) => {
    const animatedStyle = useAnimatedStyle(
        () => ({
            opacity: withDelay(delay, withTiming(1, TIMING_CONFIG)),
            transform: [{ translateY: withDelay(delay, withTiming(0, TIMING_CONFIG)) }],
        }),
        [delay],
    )

    return (
        <Animated.View style={[styles.initialAnimationState, animatedStyle]}>
            <BaseView flexDirection="column" gap={2}>
                <BaseText typographyFont={"subSubTitleSemiBold"}>{value}</BaseText>
                <BaseText typographyFont={"captionMedium"}>{label}</BaseText>
            </BaseView>
        </Animated.View>
    )
}

interface StatsProps {
    rating?: StatItemProps
    users?: StatItemProps
    co2Saved?: StatItemProps
    customStats?: StatItemProps[]
}

const Stats = ({
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
            {users && <StatItem value={users.value} label={users.label} delay={50} />}
            {co2Saved && <StatItem value={co2Saved.value} label={co2Saved.label} delay={100} />}
            {customStats.map((stat, index) => (
                <StatItem key={index} value={stat.value} label={stat.label} delay={150 + index * 50} />
            ))}
        </AnimatedBaseView>
    )
}

interface ActionsProps {
    onAddToFavorites?: () => void
    onOpen?: () => void
    isFavorite?: boolean
    openButtonText?: string
    favoriteButtonText?: string
}

const Actions = ({
    onAddToFavorites = () => {},
    onOpen = () => {},
    isFavorite = false,
    openButtonText,
    favoriteButtonText,
}: ActionsProps) => {
    const { LL } = useI18nContext()

    const favoriteButtonStyle = useAnimatedStyle(
        () => ({
            opacity: withDelay(50, withTiming(1, TIMING_CONFIG)),
            transform: [{ translateY: withDelay(50, withTiming(0, TIMING_CONFIG)) }],
        }),
        [],
    )

    const openButtonStyle = useAnimatedStyle(
        () => ({
            opacity: withDelay(100, withTiming(1, TIMING_CONFIG)),
            transform: [{ translateY: withDelay(100, withTiming(0, TIMING_CONFIG)) }],
        }),
        [],
    )

    return (
        <AnimatedBaseView layout={SMOOTH_LAYOUT} flexDirection="column" gap={16} px={0}>
            <Animated.View style={[styles.initialAnimationState, favoriteButtonStyle]}>
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

            <Animated.View style={[styles.initialAnimationState, openButtonStyle]}>
                <BaseButton action={onOpen}>{openButtonText || LL.BTN_OPEN()}</BaseButton>
            </Animated.View>
        </AnimatedBaseView>
    )
}

const Description = ({ children }: { children: string }) => {
    const theme = useTheme()

    const descriptionStyle = useAnimatedStyle(
        () => ({
            opacity: withDelay(50, withTiming(1, TIMING_CONFIG)),
            transform: [{ translateY: withDelay(50, withTiming(0, TIMING_CONFIG)) }],
        }),
        [],
    )

    return (
        <AnimatedBaseView layout={SMOOTH_LAYOUT} flexDirection="row" gap={8} alignItems="flex-start">
            <Animated.View style={[styles.initialAnimationState, descriptionStyle]}>
                <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600} typographyFont="body">
                    {children}
                </BaseText>
            </Animated.View>
        </AnimatedBaseView>
    )
}

const Container = ({ children }: PropsWithChildren) => {
    return (
        <AnimatedBaseView layout={SMOOTH_LAYOUT} flexDirection="column" gap={8} px={24} pb={24}>
            {children}
        </AnimatedBaseView>
    )
}

type Props = PropsWithChildren<{
    show: boolean
    visible?: boolean
}>

const X2EAppDetails = ({ children, show, visible = show }: Props) => {
    const animatedStyles = useAnimatedStyle(() => {
        const shouldShow = show && visible

        return {
            opacity: shouldShow ? withTiming(1, TIMING_CONFIG) : withTiming(0, CLOSING_TIMING),
            height: show ? "auto" : 0,
            transform: [
                {
                    translateY: shouldShow ? withTiming(0, TIMING_CONFIG) : withTiming(-5, CLOSING_TIMING),
                },
            ],
        }
    }, [show, visible])

    return (
        <AnimatedBaseView
            layout={SMOOTH_LAYOUT}
            style={[styles.detailsContainer, animatedStyles]}
            flexDirection="column">
            {children}
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
})
