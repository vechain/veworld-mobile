import React from "react"
import { StyleSheet } from "react-native"
import { BaseText, BaseView } from "~Components/Base"
import { BlurView } from "~Components/Reusable"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { StringUtils } from "~Utils"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

type Props = {
    title: string
    parsedValue: string
    unit: string
}

export const StargateStatsCard = ({ title, parsedValue, unit }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.root} testID={`STATS_CARD_${StringUtils.toUppercase(title)}`} h={100}>
            <BlurView overlayColor="transparent" blurAmount={10} style={styles.blur}>
                <BaseView
                    flexDirection="column"
                    gap={12}
                    p={16}
                    justifyContent="space-between"
                    alignItems="flex-start"
                    flex={1}>
                    <BaseText color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE} typographyFont="captionSemiBold">
                        {title}
                    </BaseText>

                    <BaseView flexDirection="column" alignItems="flex-start" gap={4}>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                            typographyFont="subSubTitleSemiBold"
                            testID="STATS_CARD_VALUE">
                            {parsedValue}
                        </BaseText>
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                            typographyFont="smallCaptionMedium"
                            testID="STATS_CARD_UNIT">
                            {unit}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BlurView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    const blurDarkBg = isAndroid() ? "rgba(89, 82, 127, 0.65)" : "rgba(3, 3, 4, 0.4)"

    return StyleSheet.create({
        root: {
            flex: 1,
            borderWidth: 1,
            borderColor: "rgba(185, 181, 207, 0.15)",
            borderRadius: 16,
            flexDirection: "column",
            overflow: "hidden",
        },
        blur: {
            backgroundColor: theme.isDark ? blurDarkBg : theme.colors.transparent,
            height: "100%",
        },
    })
}
