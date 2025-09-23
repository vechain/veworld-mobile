import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { b3mo } from "~Assets"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { useUserVeBetterStats } from "~Hooks/useUserVeBetterStats"
import { useI18nContext } from "~i18n"
import { BigNutils } from "~Utils"
import { RewardsEarned } from "./RewardsEarned"
import { StatsCard } from "./StatsCard"

export const VeBetterDaoCard = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const { data } = useUserVeBetterStats()
    const { formatLocale } = useFormatFiat()

    const stats = useMemo(() => {
        if (!data) return { co2: 0, water: 0, energy: 0, plastic: 0 }
        return {
            co2: data.totalImpact.carbon,
            water: data.totalImpact.water,
            energy: data.totalImpact.energy,
            plastic: data.totalImpact.plastic,
        }
    }, [data])

    return (
        <BaseView style={styles.root}>
            <FastImage source={b3mo} style={styles.b3mo as ImageStyle} />
            <BaseView pb={16} flexDirection="column" gap={8}>
                <BaseText color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500} typographyFont="bodySemiBold">
                    {LL.VBD_YOUR_BETTER_ACTIONS()}
                </BaseText>
                <BaseText color={theme.isDark ? COLORS.WHITE : COLORS.GREY_700} style={styles.actionsText}>
                    {BigNutils(data?.actionsRewarded ?? "0").toCurrencyFormat_string(0, formatLocale)}
                </BaseText>
            </BaseView>

            <BaseSpacer height={16} />

            <BaseView flexDirection="row" gap={8}>
                <BaseIcon name="icon-leaf" color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE} size={16} py={4} />
                <BaseText color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE} typographyFont="bodySemiBold">
                    {LL.VBD_YOUR_OFFSET()}
                </BaseText>
            </BaseView>

            <BaseSpacer height={8} />

            <BaseView w={100} flexDirection="column" gap={8}>
                <BaseView flexDirection="row" gap={8}>
                    <StatsCard label="co2" value={stats.co2} />
                    <StatsCard label="energy" value={stats.energy} />
                </BaseView>
                <BaseView flexDirection="row" gap={8}>
                    <StatsCard label="water" value={stats.water} />
                    <StatsCard label="plastic" value={stats.plastic} />
                </BaseView>
            </BaseView>

            <BaseSpacer height={16} />

            <RewardsEarned week={data?.week} month={data?.month} total={data?.totalRewardAmount} />

            <BaseSpacer height={16} />

            <BaseButton
                action={() => {}}
                variant="ghost"
                rightIcon={<BaseIcon name="icon-arrow-link" color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE} />}
                typographyFont="bodyMedium"
                textColor={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE}
                selfAlign="center"
                py={0}>
                {LL.VBD_SEE_PROFILE()}
            </BaseButton>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            paddingTop: 32,
            paddingBottom: 24,
            paddingHorizontal: 24,
            position: "relative",
            flexDirection: "column",
            borderRadius: 16,
        },
        actionsText: {
            fontWeight: 600,
            fontSize: 40,
            fontFamily: "Inter-SemiBold",
            lineHeight: 40,
        },
        b3mo: {
            position: "absolute",
            right: -24,
            top: 8,
            width: 196,
            height: 196,
        },
        b3tr3D: {
            position: "absolute",
            right: -20,
            top: -20,
            width: 68,
            height: 68,
        },
        rewards: {
            position: "relative",
            borderWidth: 1,
            borderColor: "rgba(185, 181, 207, 0.15)",
            backgroundColor: theme.isDark ? "rgba(89, 82, 127, 0.65)" : theme.colors.transparent,
        },
    })
