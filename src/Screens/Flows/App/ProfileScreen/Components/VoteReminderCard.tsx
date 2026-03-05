import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useHasVotedInCurrentRound, useThemedStyles } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useIsVeBetterUser } from "~Hooks/useIsVeBetterUser"
import { useOfflineCallback } from "~Hooks/useOfflineCallback"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

const VBD_VOTING_URL = "https://governance.vebetterdao.org/allocations"

export const VoteReminderCard = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { navigateWithTab } = useBrowserTab()
    const { data: isVeBetterUser } = useIsVeBetterUser()
    const { data: voteData } = useHasVotedInCurrentRound()

    const showVoteReminder = useMemo(() => {
        if (!isVeBetterUser) return false
        if (!voteData) return false
        return !voteData.hasVotedInCurrentRound
    }, [isVeBetterUser, voteData])

    const currentRoundNumber = useMemo(() => parseInt(voteData?.currentRoundId ?? "0", 10), [voteData?.currentRoundId])
    const isRoundEndingSoon = useMemo(() => {
        const now = new Date()
        const endOfWeek = new Date(now)
        const daysUntilSunday = (7 - now.getDay()) % 7
        endOfWeek.setDate(now.getDate() + daysUntilSunday)
        endOfWeek.setHours(23, 59, 59, 999)

        const millisecondsUntilEnd = endOfWeek.getTime() - now.getTime()
        return millisecondsUntilEnd >= 0 && millisecondsUntilEnd <= 2 * 24 * 60 * 60 * 1000
    }, [])

    const onNavigateToVoting = useCallback(() => {
        navigateWithTab({
            url: VBD_VOTING_URL,
            title: VBD_VOTING_URL,
            navigationFn(url) {
                nav.navigate(Routes.BROWSER, { url, returnScreen: Routes.PROFILE })
            },
        })
    }, [nav, navigateWithTab])

    const onPressVoteReminder = useOfflineCallback(onNavigateToVoting)
    const borderProgress = useSharedValue(0)
    const emphasisProgress = useSharedValue(0)

    useEffect(() => {
        borderProgress.value = withRepeat(
            withTiming(1, {
                duration: 1800,
                easing: Easing.out(Easing.quad),
            }),
            -1,
            true,
        )
    }, [borderProgress])

    useEffect(() => {
        if (!isRoundEndingSoon) {
            emphasisProgress.value = 0
            return
        }

        emphasisProgress.value = withRepeat(
            withTiming(1, {
                duration: 1800,
                easing: Easing.out(Easing.quad),
            }),
            -1,
            false,
        )
    }, [emphasisProgress, isRoundEndingSoon])

    const animatedWaveFillStyle = useAnimatedStyle(() => {
        const progress = emphasisProgress.value
        const startFill = theme.isDark ? "rgba(177, 255, 65, 0.14)" : "rgba(71, 44, 142, 0.1)"
        const endFill = theme.isDark ? "rgba(177, 255, 65, 0)" : "rgba(71, 44, 142, 0)"

        return {
            backgroundColor: interpolateColor(progress, [0, 1], [startFill, endFill]),
            opacity: isRoundEndingSoon ? 1 - progress : 0,
            transform: [{ scale: 1 + progress * 0.16 }],
        }
    }, [theme.isDark, isRoundEndingSoon])

    const animatedBorderStyle = useAnimatedStyle(() => {
        const startColor = theme.isDark ? "rgba(177, 255, 65, 0.25)" : "rgba(71, 44, 142, 0.22)"
        const endColor = theme.isDark ? "rgba(177, 255, 65, 0.9)" : "rgba(71, 44, 142, 0.8)"

        return {
            borderColor: interpolateColor(borderProgress.value, [0, 1], [startColor, endColor]),
            opacity: 0.6 + borderProgress.value * 0.4,
        }
    }, [theme.isDark])

    const animatedRipplePrimaryStyle = useAnimatedStyle(() => {
        const rippleBase = theme.isDark ? "rgba(177, 255, 65, 0.35)" : "rgba(71, 44, 142, 0.3)"
        const rippleFade = theme.isDark ? "rgba(177, 255, 65, 0)" : "rgba(71, 44, 142, 0)"
        const progress = emphasisProgress.value

        return {
            backgroundColor: interpolateColor(progress, [0, 1], [rippleBase, rippleFade]),
            opacity: isRoundEndingSoon ? 1 - progress : 0,
            transform: [{ scaleX: 1 + progress * 0.12 }, { scaleY: 1 + progress * 0.5 }],
        }
    }, [theme.isDark, isRoundEndingSoon])

    const animatedRippleSecondaryStyle = useAnimatedStyle(() => {
        const rippleBase = theme.isDark ? "rgba(177, 255, 65, 0.3)" : "rgba(71, 44, 142, 0.26)"
        const rippleFade = theme.isDark ? "rgba(177, 255, 65, 0)" : "rgba(71, 44, 142, 0)"
        const progress = (emphasisProgress.value + 0.5) % 1

        return {
            backgroundColor: interpolateColor(progress, [0, 1], [rippleBase, rippleFade]),
            opacity: isRoundEndingSoon ? 1 - progress : 0,
            transform: [{ scaleX: 1 + progress * 0.12 }, { scaleY: 1 + progress * 0.5 }],
        }
    }, [theme.isDark, isRoundEndingSoon])

    if (!showVoteReminder) return null

    return (
        <BaseView style={styles.voteReminderWrapper}>
            <Animated.View pointerEvents="none" style={[styles.waveFill, animatedWaveFillStyle]} />
            <Animated.View pointerEvents="none" style={[styles.rippleRing, animatedRippleSecondaryStyle]} />
            <Animated.View pointerEvents="none" style={[styles.rippleRing, animatedRipplePrimaryStyle]} />
            <BaseView style={styles.voteReminderCard}>
                <Animated.View pointerEvents="none" style={[styles.animatedBorder, animatedBorderStyle]} />
                <BaseView flex={1} justifyContent="center" gap={4}>
                    <BaseView flexDirection="row" alignItems="center" gap={8}>
                        <BaseIcon
                            name="icon-clock"
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}
                            size={16}
                        />
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}>
                            {isRoundEndingSoon
                                ? LL.VBD_ALERT_TITLE_ROUND_ENDING_SOON({ roundNumber: currentRoundNumber })
                                : LL.VBD_ALERT_TITLE_ROUND_IS_LIVE({ roundNumber: currentRoundNumber })}
                        </BaseText>
                    </BaseView>
                    <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}>
                        {LL.VBD_ALERT_DESCRIPTION_ROUND_VOTE()}
                    </BaseText>
                </BaseView>
                <BaseButton
                    size="sm"
                    action={onPressVoteReminder}
                    style={styles.voteReminderButton}
                    py={0}
                    typographyFont="bodySemiBold"
                    textColor={theme.isDark ? COLORS.PURPLE : COLORS.WHITE}
                    bgColor={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}>
                    {LL.VBD_ALERT_BUTTON_VOTE_NOW()}
                </BaseButton>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        voteReminderWrapper: {
            position: "relative",
            marginTop: 8,
            overflow: "visible",
        },
        voteReminderCard: {
            position: "relative",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: 16,
            padding: 16,
            gap: 12,
            zIndex: 2,

            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
        waveFill: {
            position: "absolute",
            top: -4,
            right: -4,
            bottom: -4,
            left: -4,
            borderRadius: 20,
            zIndex: 0,
        },
        animatedBorder: {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            borderWidth: 1.5,
            borderRadius: 16,
        },
        rippleRing: {
            position: "absolute",
            top: -3,
            right: -3,
            bottom: -3,
            left: -3,
            borderRadius: 18,
            zIndex: 1,
        },
        voteReminderButton: {
            height: 42,
            justifyContent: "center",
            alignItems: "center",
        },
    })
