import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
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

    if (!showVoteReminder) return null

    return (
        <BaseView style={styles.voteReminderCard}>
            <BaseView flex={1} justifyContent="center" gap={4}>
                <BaseView flexDirection="row" alignItems="center" gap={8}>
                    <BaseIcon name="icon-clock" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800} size={16} />
                    <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}>
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
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        voteReminderCard: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            borderRadius: 16,
            padding: 16,
            gap: 12,

            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
        voteReminderButton: {
            height: 42,
            justifyContent: "center",
            alignItems: "center",
        },
    })
