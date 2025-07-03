import { useNavigation } from "@react-navigation/native"
import { PropsWithChildren, default as React, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { BaseButton, BaseCard, BaseIcon, BaseText, BaseView, FiatBalance } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useB3trStats } from "~Hooks/useB3trStats"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

const BetterStatsItemText = ({ children }: PropsWithChildren) => {
    const { theme } = useThemedStyles(baseStyles)
    return (
        <BaseText typographyFont="captionMedium" color={theme.isDark ? theme.colors.text : theme.colors.subSubtitle}>
            {children}
        </BaseText>
    )
}

const BetterStatsItemContainer = ({ children }: PropsWithChildren) => {
    return (
        <BaseView flexDirection="row" gap={16} alignItems="center" w={100}>
            {children}
        </BaseView>
    )
}

const BetterStatsItem = ({ children, applyStyles = true }: PropsWithChildren<{ applyStyles?: boolean }>) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseView
            justifyContent="space-between"
            alignItems="center"
            px={24}
            py={12}
            flexDirection="row"
            w={100}
            style={applyStyles ? styles.rowElement : undefined}>
            {children}
        </BaseView>
    )
}

export const BetterStats = () => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)
    const navigation = useNavigation()
    const { data } = useB3trStats()
    const currency = useAppSelector(selectCurrency)

    const onSeeProfile = useCallback(() => {
        navigation.navigate(Routes.BROWSER, {
            url: "https://governance.vebetterdao.org/",
        })
    }, [navigation])

    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[B3TR.symbol],
        vs_currency: currency,
    })

    const fiatTotalBalance = useMemo(
        () => BigNutils().toCurrencyConversion(data?.totalRewardAmount.toString() ?? "0", exchangeRate),
        [data?.totalRewardAmount, exchangeRate],
    )

    return (
        <BaseCard style={styles.card} containerStyle={styles.cardContainer}>
            <BaseView
                justifyContent="space-between"
                alignItems="center"
                p={16}
                flexDirection="row"
                w={100}
                style={styles.rowElement}>
                <BaseText color={theme.colors.text} typographyFont="bodySemiBold">
                    {LL.YOUR_BETTER_STATS()}
                </BaseText>
                <BaseButton
                    rightIcon={
                        <BaseIcon
                            name="icon-arrow-link"
                            color={theme.colors.text}
                            size={14}
                            action={onSeeProfile}
                            style={styles.arrowLinkIcon}
                        />
                    }
                    action={onSeeProfile}
                    textColor={theme.colors.text}
                    variant="ghost"
                    typographyFont="bodyMedium"
                    p={0}
                    px={0}
                    py={0}>
                    {LL.SEE_PROFILE()}
                </BaseButton>
            </BaseView>
            <BetterStatsItem>
                <BetterStatsItemContainer>
                    <TokenImage isVechainToken iconSize={24} icon={B3TR.icon} />
                    <BetterStatsItemText>{LL.TOTAL_B3TR_EARNED()}</BetterStatsItemText>
                    <BaseView style={styles.valueTextStyle} flexDirection="column" gap={2}>
                        <BaseText typographyFont="bodySemiBold" color={theme.colors.activityCard.title} align="right">
                            {BigNutils(data?.totalRewardAmount).toTokenFormatFull_string(2)}
                        </BaseText>
                        <FiatBalance
                            typographyFont="captionMedium"
                            color={theme.colors.activityCard.subtitleLight}
                            balances={[fiatTotalBalance.value]}
                            isVisible
                            style={styles.valueTextStyle}
                        />
                    </BaseView>
                </BetterStatsItemContainer>
            </BetterStatsItem>
            <BetterStatsItem>
                <BetterStatsItemContainer>
                    <BaseIcon
                        name="icon-leaf"
                        size={12}
                        p={6}
                        bg={theme.isDark ? theme.colors.transparent : theme.colors.cardDivider}
                        color={theme.colors.actionBottomSheet.icon}
                    />
                    <BetterStatsItemText>{LL.TOTAL_BETTER_ACTIONS()}</BetterStatsItemText>
                    <BaseText
                        typographyFont="bodySemiBold"
                        color={theme.colors.activityCard.title}
                        align="right"
                        containerStyle={styles.valueTextStyle}>
                        {data?.actionsRewarded}
                    </BaseText>
                </BetterStatsItemContainer>
            </BetterStatsItem>
            <BetterStatsItem applyStyles={false}>
                <BetterStatsItemContainer>
                    <BaseIcon
                        name="icon-leaf"
                        size={12}
                        p={6}
                        bg={theme.isDark ? theme.colors.transparent : theme.colors.cardDivider}
                        color={theme.colors.actionBottomSheet.icon}
                    />
                    <BetterStatsItemText>{LL.CO2_OFFSET()}</BetterStatsItemText>
                    <BaseText
                        typographyFont="bodySemiBold"
                        color={theme.colors.activityCard.title}
                        align="right"
                        containerStyle={styles.valueTextStyle}>
                        {LL.KILOGRAMS({
                            value: BigNutils(data?.totalImpact.carbon).div(1000).toTokenFormatFull_string(2),
                        })}
                    </BaseText>
                </BetterStatsItemContainer>
            </BetterStatsItem>
        </BaseCard>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        card: {
            padding: 0,
            flexDirection: "column",
            backgroundColor: theme.colors.b3trStatsCard.bg,
        },
        cardContainer: {
            overflow: "hidden",
        },
        arrowLinkIcon: {
            marginLeft: 4,
        },
        rowElement: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.b3trStatsCard.divider,
        },
        valueTextStyle: {
            marginLeft: "auto",
        },
    })
}
