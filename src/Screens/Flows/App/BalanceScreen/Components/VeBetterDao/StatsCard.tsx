import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView, BlurView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { StringUtils } from "~Utils"

type Props = {
    label: "co2" | "water" | "trees"
    value: number
}

export const StatsCard = ({ label, value }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const icon = useMemo((): IconKey => {
        switch (label) {
            case "co2":
                return "icon-leaf"
            case "water":
                return "icon-droplets"
            case "trees":
                return "icon-tree-pine"
        }
    }, [label])

    const unit = useMemo(() => {
        switch (label) {
            case "co2":
                return "Kg"
            case "water":
                return "L"
            case "trees":
                return null
        }
    }, [label])

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
                            -{value}
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
