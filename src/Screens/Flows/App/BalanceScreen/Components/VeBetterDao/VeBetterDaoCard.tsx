import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { b3mo } from "~Assets"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useIsVeBetterUser } from "~Hooks/useIsVeBetterUser"
import { useUserVeBetterStats } from "~Hooks/useUserVeBetterStats"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { formatDisplayNumber } from "~Utils/StandardizedFormatting"
import { RewardsEarned } from "./RewardsEarned"
import { StatsCard } from "./StatsCard"

const PROFILE_URL = "https://governance.vebetterdao.org/profile"

export const VeBetterDaoCard = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const { data } = useUserVeBetterStats()
    const { data: isVeBetterUser } = useIsVeBetterUser()
    const { formatLocale } = useFormatFiat()

    const stats = useMemo(() => {
        if (!data) return { co2: 0, water: 0, energy: 0, plastic: 0 }
        return {
            co2: data.totalImpact.carbon ?? 0,
            water: data.totalImpact.water ?? 0,
            energy: data.totalImpact.energy ?? 0,
            plastic: data.totalImpact.plastic ?? 0,
        }
    }, [data])

    const nav = useNavigation()
    const { navigateWithTab } = useBrowserTab()

    const onVeBetterNavigate = useCallback(() => {
        navigateWithTab({
            url: PROFILE_URL,
            title: PROFILE_URL,
            navigationFn(url) {
                nav.navigate(Routes.BROWSER, { url, returnScreen: Routes.HOME })
            },
        })
    }, [nav, navigateWithTab])

    if (!isVeBetterUser) return null

    return (
        <BaseView style={styles.root} testID="VEBETTER_DAO_CARD">
            <BaseView style={styles.b3mo}>
                <FastImage
                    source={b3mo}
                    resizeMode={FastImage.resizeMode.contain}
                    style={styles.b3moImage as ImageStyle}
                />
            </BaseView>
            <BaseView pb={16} flexDirection="column" gap={8}>
                <BaseText color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500} typographyFont="subSubTitleSemiBold">
                    {LL.VBD_YOUR_BETTER_ACTIONS()}
                </BaseText>
                <BaseText color={theme.isDark ? COLORS.WHITE : COLORS.GREY_700} style={styles.actionsText}>
                    {formatDisplayNumber(data?.actionsRewarded ?? "0", { locale: formatLocale, forceDecimals: 0 })}
                </BaseText>
            </BaseView>

            <BaseSpacer height={16} />

            <BaseView flexDirection="row" gap={8}>
                <BaseIcon
                    name="icon-leafs"
                    color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.PURPLE}
                    size={16}
                    py={4}
                />
                <BaseText
                    color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.PURPLE}
                    typographyFont="subSubTitleSemiBold">
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
                action={onVeBetterNavigate}
                variant="ghost"
                rightIcon={
                    <BaseIcon
                        name="icon-arrow-link"
                        color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE}
                        size={20}
                    />
                }
                typographyFont="subSubTitleMedium"
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
        b3moImage: {
            width: "100%",
            height: "100%",
        },
    })
