import React from "react"
import { StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { b3tr3D } from "~Assets"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { B3TR, COLORS, ColorThemeType } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { BigNutils } from "~Utils"

type Props = {
    total: number | string | undefined
    week: number | string | undefined
    month: number | string | undefined
}

export const RewardsEarned = ({ week, month, total }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { formatLocale } = useFormatFiat()
    return (
        <BaseView style={styles.root} gap={8}>
            <BaseView flexDirection="row" gap={8}>
                <BaseIcon name="icon-gift" color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.PURPLE} size={16} />
                <BaseText
                    color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.PURPLE}
                    typographyFont="subSubTitleSemiBold">
                    {LL.VBD_REWARDS_EARNED()}
                </BaseText>
            </BaseView>
            <BaseView pt={16} px={24} pb={8} gap={8} flexDirection="column" style={styles.inner}>
                <FastImage source={b3tr3D} style={styles.b3tr3D as ImageStyle} />
                <BaseView flexDirection="column">
                    <BaseView py={4} flexDirection="row" justifyContent="space-between">
                        <BaseText color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500} typographyFont="bodyMedium">
                            {LL.THIS_WEEK()}
                        </BaseText>
                        <BaseView flexDirection="row" gap={8}>
                            <BaseText
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                                typographyFont="bodySemiBold"
                                testID="REWARDS_EARNED_WEEK_VALUE">
                                {BigNutils(week ?? "0").toTokenFormatFull_string(2, formatLocale)}
                            </BaseText>
                            <BaseText
                                color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                                typographyFont="captionMedium">
                                {B3TR.symbol}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                    <BaseView py={4} flexDirection="row" justifyContent="space-between">
                        <BaseText color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500} typographyFont="bodyMedium">
                            {LL.THIS_MONTH()}
                        </BaseText>
                        <BaseView flexDirection="row" gap={8}>
                            <BaseText
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                                typographyFont="bodySemiBold"
                                testID="REWARDS_EARNED_MONTH_VALUE">
                                {BigNutils(month ?? "0").toTokenFormatFull_string(2, formatLocale)}
                            </BaseText>
                            <BaseText
                                color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                                typographyFont="captionMedium">
                                {B3TR.symbol}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                </BaseView>
                <BaseSpacer height={1} width={"100%"} background="rgba(185, 181, 207, 0.15)" />
                <BaseView py={6} flexDirection="row" justifyContent="space-between">
                    <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700} typographyFont="bodyMedium">
                        {LL.TOTAL()}
                    </BaseText>
                    <BaseView flexDirection="row" gap={8}>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                            typographyFont="subSubTitleSemiBold"
                            testID="REWARDS_EARNED_TOTAL_VALUE">
                            {BigNutils(total ?? "0").toTokenFormatFull_string(2, formatLocale)}
                        </BaseText>
                        <BaseText color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500} typographyFont="bodyMedium">
                            {B3TR.symbol}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        b3tr3D: {
            position: "absolute",
            right: -12,
            top: -36,
            width: 56,
            height: 56,
            zIndex: 10,
        },
        root: {
            position: "relative",
        },
        inner: {
            borderWidth: 1,
            borderColor: "rgba(185, 181, 207, 0.15)",
            backgroundColor: theme.isDark ? "rgba(89, 82, 127, 0.25)" : theme.colors.transparent,
            borderRadius: 16,
            position: "relative",
        },
    })
