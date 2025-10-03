import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView, BlurView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { BigNutils, StringUtils } from "~Utils"

type Props = {
    label: "co2" | "water" | "energy" | "plastic"
    value: number
}

export const StatsCard = ({ label, value }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { formatLocale } = useFormatFiat()
    const icon = useMemo((): IconKey => {
        switch (label) {
            case "co2":
                return "icon-leaf"
            case "water":
                return "icon-droplets"
            case "energy":
                return "icon-plug"
            case "plastic":
                return "icon-cup-soda"
        }
    }, [label])

    const { unit, value: parsedValue } = useMemo(() => {
        switch (label) {
            case "co2":
            case "plastic":
                return {
                    unit: "Kg",
                    value: BigNutils(value).div(BigNutils(10).toBN.pow(3)).toCompactString(formatLocale, 0),
                }
            case "water":
                return {
                    unit: "L",
                    value: BigNutils(value).div(BigNutils(10).toBN.pow(3)).toCompactString(formatLocale, 0),
                }
            case "energy":
                return {
                    unit: "KWh",
                    value: BigNutils(value).div(BigNutils(10).toBN.pow(3)).toCompactString(formatLocale, 0),
                }
        }
    }, [formatLocale, label, value])

    const description = useMemo(() => {
        switch (label) {
            case "co2":
                return LL.VBD_STAT_REDUCED()
            case "water":
                return LL.VBD_STAT_CONSERVED()
            case "energy":
                return LL.VBD_STAT_SAVED()
            case "plastic":
                return LL.VBD_STAT_AVOIDED()
        }
    }, [LL, label])

    return (
        <BaseView style={styles.root} testID={`STATS_CARD_${label}`}>
            <BlurView overlayColor="transparent" blurAmount={10} style={styles.blur}>
                <BaseView flexDirection="column" p={16} justifyContent="center" alignItems="center">
                    <BaseIcon color={COLORS.LIGHT_GREEN} size={24} name={icon} />
                    <BaseSpacer height={8} />
                    <BaseText color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500} typographyFont="bodySemiBold">
                        {LL[`VBD_STAT_${StringUtils.toUppercase(label)}`]()}
                    </BaseText>
                    <BaseText
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                        typographyFont="captionMedium"
                        textTransform="lowercase">
                        {description}
                    </BaseText>
                    <BaseSpacer height={12} />
                    <BaseView flexDirection="row" alignItems="center" gap={2}>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                            typographyFont="subTitleSemiBold"
                            testID="STATS_CARD_VALUE">
                            {parsedValue}
                        </BaseText>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                            typographyFont="captionMedium"
                            testID="STATS_CARD_UNIT">
                            {unit}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BlurView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            flex: 1,
            borderWidth: 1,
            borderColor: "rgba(185, 181, 207, 0.15)",
            borderRadius: 16,
            flexDirection: "column",
            overflow: "hidden",
        },
        blur: {
            backgroundColor: theme.isDark ? "rgba(89, 82, 127, 0.25)" : theme.colors.transparent,
        },
    })
