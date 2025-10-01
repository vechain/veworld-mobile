import React from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { BlurView } from "~Components/Reusable"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    title: string
    parsedValue: string
    unit: string
}

export const StargateStatsCard = ({ title, parsedValue, unit }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.root} testID={`STATS_CARD_${"stargate"}`}>
            <BlurView overlayColor="transparent" blurAmount={10} style={styles.blur}>
                <BaseView flexDirection="column" p={16} justifyContent="center" alignItems="flex-start">
                    <BaseText color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE} typographyFont="bodySemiBold">
                        {title}
                    </BaseText>

                    <BaseSpacer height={12} />
                    <BaseView flexDirection="column" alignItems="flex-start" gap={4}>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                            typographyFont="subTitleSemiBold"
                            testID="STATS_CARD_VALUE">
                            {parsedValue}
                        </BaseText>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
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
