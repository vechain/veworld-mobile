import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { b3moEmpty, B3trLogoSVG, VeBetterFullLogoSVG } from "~Assets"
import { BaseButton, BaseText, BaseTouchable, BaseView, Icon, useFeatureFlags } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useFormatFiat, useThemedStyles, useVeBetterGlobalOverview } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { setHideNewUserVeBetterCard, useAppDispatch } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { StatsCard } from "./StatsCard"

export const NewUserVeBetterCard = () => {
    const { styles, theme } = useThemedStyles(style)
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { formatLocale } = useFormatFiat()
    const { data: globalOverview } = useVeBetterGlobalOverview()

    const { betterWorldFeature } = useFeatureFlags()

    const navigateToAppScreen = useCallback(() => {
        if (betterWorldFeature.appsScreen.enabled) {
            nav.navigate(Routes.APPS_STACK, { screen: Routes.APPS })
        } else {
            nav.navigate(Routes.DISCOVER_STACK, { screen: Routes.DISCOVER })
        }
    }, [betterWorldFeature.appsScreen.enabled, nav])

    const closeCard = useCallback(() => {
        dispatch(setHideNewUserVeBetterCard(true))
    }, [dispatch])

    const StatItem = useMemo(() => {
        return ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                <BaseView flexDirection="row" gap={12} alignItems="center">
                    {icon}
                    <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}>
                        {label}
                    </BaseText>
                </BaseView>
                <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}>
                    {value}
                </BaseText>
            </BaseView>
        )
    }, [theme.isDark])

    return (
        <BaseView style={styles.root} testID="VEBETTER_DAO_NEW_USER_CARD">
            <BaseTouchable style={styles.closeIcon} action={closeCard} haptics="Light">
                <Icon name="icon-x" color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE} size={16} />
            </BaseTouchable>
            <BaseView flexDirection="column" gap={16}>
                <BaseView flexDirection="row" gap={6}>
                    <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE}>
                        {LL.VBD_JOIN_THE()}
                    </BaseText>
                    <VeBetterFullLogoSVG height={16} />
                    <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE}>
                        {LL.VBD_MOVEMENT()}
                    </BaseText>
                </BaseView>

                <BaseView flexDirection="column" style={styles.inner}>
                    <StatItem
                        icon={<Icon name="icon-leafs" color={COLORS.LIGHT_GREEN} size={24} />}
                        label={LL.VBD_TOTAL_ACTIONS()}
                        value={BigNutils(globalOverview?.actionsRewarded ?? 0).toCompactString(formatLocale, 1)}
                    />
                    <StatItem
                        icon={<B3trLogoSVG color={COLORS.LIGHT_GREEN} width={24} height={20} />}
                        label={LL.VBD_TOTAL_REWARDED()}
                        value={BigNutils(globalOverview?.totalRewardAmount ?? 0).toCompactString(formatLocale, 1)}
                    />
                </BaseView>
            </BaseView>

            <BaseView flexDirection="column" gap={6}>
                <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}>
                    {LL.VBD_GET_REWARDED()}
                </BaseText>
                <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}>
                    {LL.VBD_CONTRIBUTE_OFFSET()}
                </BaseText>
            </BaseView>

            <BaseView w={100} flexDirection="column" gap={8}>
                <BaseView style={styles.b3mo}>
                    <FastImage
                        source={b3moEmpty}
                        resizeMode={FastImage.resizeMode.contain}
                        style={styles.b3moImage as ImageStyle}
                    />
                </BaseView>
                <BaseView flexDirection="row" gap={8}>
                    <StatsCard label="co2" value={globalOverview?.totalImpact?.carbon ?? 0} />
                    <StatsCard label="energy" value={globalOverview?.totalImpact?.energy ?? 0} />
                </BaseView>
                <BaseView flexDirection="row" gap={8}>
                    <StatsCard label="water" value={globalOverview?.totalImpact?.water ?? 0} />
                    <StatsCard label="plastic" value={globalOverview?.totalImpact?.plastic ?? 0} />
                </BaseView>
            </BaseView>

            <BaseButton
                action={navigateToAppScreen}
                style={styles.button}
                bgColor={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}
                py={0}>
                <BaseView
                    flexDirection="row"
                    gap={8}
                    h={100}
                    pt={4}
                    alignItems="center"
                    justifyContent="center"
                    alignSelf="center">
                    <BaseText
                        alignContainer="center"
                        typographyFont="bodySemiBold"
                        color={theme.isDark ? COLORS.PURPLE : COLORS.WHITE}>
                        {LL.VBD_START_YOUR_IMPACT()}
                    </BaseText>
                    <Icon name="icon-arrow-right" color={theme.isDark ? COLORS.PURPLE : COLORS.WHITE} size={20} />
                </BaseView>
            </BaseButton>
        </BaseView>
    )
}

const style = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            gap: 24,
            paddingTop: 32,
            paddingBottom: 24,
            paddingHorizontal: 24,
            position: "relative",
            flexDirection: "column",
            borderRadius: 16,
        },
        inner: {
            borderWidth: 1,
            borderColor: "rgba(185, 181, 207, 0.15)",
            backgroundColor: theme.isDark ? "rgba(89, 82, 127, 0.25)" : theme.colors.transparent,
            borderRadius: 16,
            position: "relative",
            paddingTop: 20,
            paddingHorizontal: 24,
            paddingBottom: 20,
            gap: 20,
        },
        b3mo: {
            position: "absolute",
            right: -28,
            top: -85,
            width: 112,
            height: 112,
        },
        b3moImage: {
            width: "100%",
            height: "100%",
        },
        button: {
            height: 42,
        },
        closeIcon: {
            position: "absolute",
            padding: 8,
            right: 8,
            top: 8,
        },
    })
