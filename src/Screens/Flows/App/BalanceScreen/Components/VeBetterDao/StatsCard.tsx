import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView, BlurView } from "~Components"
import { COLORS } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { BigNutils, StringUtils } from "~Utils"

type Props = {
    label: "co2" | "water" | "trees"
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
            case "trees":
                return "icon-trees"
        }
    }, [label])

    // const { unit, value: parsedValue } = useMemo(() => {
    //     switch (label) {
    //         case "co2":
    //             return UnitOfMeasureUtils.formatValue(value, {
    //                 availableUnits: GRAMS_UNITS,
    //                 minUnit: "Kg",
    //                 locale: formatLocale,
    //             })
    //         case "water":
    //             return UnitOfMeasureUtils.formatValue(value, {
    //                 availableUnits: LITERS_UNITS,
    //                 minUnit: "L",
    //                 locale: formatLocale,
    //             })
    //         case "trees":
    //             return { unit: null, value: value.toString() }
    //     }
    // }, [formatLocale, label, value])

    const { unit, value: parsedValue } = useMemo(() => {
        switch (label) {
            case "co2":
                return {
                    unit: "Kg",
                    value: BigNutils(value).div(BigNutils(10).toBN.pow(3)).toCompactString(formatLocale, 0),
                }
            case "water":
                return {
                    unit: "L",
                    value: BigNutils(value).div(BigNutils(10).toBN.pow(3)).toCompactString(formatLocale, 0),
                }
            case "trees":
                return { unit: null, value: value.toString() }
        }
    }, [formatLocale, label, value])

    return (
        <BaseView style={styles.root}>
            <BlurView overlayColor="transparent" blurAmount={10}>
                <BaseView flexDirection="column" p={16} justifyContent="center" alignItems="center">
                    <BaseIcon color={COLORS.LIGHT_GREEN} size={24} name={icon} />
                    <BaseSpacer height={8} />
                    <BaseText
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                        typographyFont="smallCaptionSemiBold">
                        {LL[`VBD_STAT_${StringUtils.toUppercase(label)}`]()}
                    </BaseText>
                    <BaseSpacer height={12} />
                    <BaseView flexDirection="row" alignItems="center" gap={2}>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                            typographyFont="subSubTitleSemiBold">
                            -{parsedValue}
                        </BaseText>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                            typographyFont="smallCaptionMedium">
                            {unit}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BlurView>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flex: 1,
            borderWidth: 1,
            borderColor: "rgba(185, 181, 207, 0.15)",
            borderRadius: 16,
            // justifyContent: "center",
            flexDirection: "column",
            overflow: "hidden",
        },
        blur: {
            padding: 16,
            width: "100%",
        },
    })
