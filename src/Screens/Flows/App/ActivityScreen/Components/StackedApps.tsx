import React, { useMemo } from "react"
import { PixelRatio, StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { Extrapolation, interpolate } from "react-native-reanimated"
import { BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles, useVeBetterDaoDapps } from "~Hooks"
import { useAppLogo } from "~Hooks/useAppLogo"
import { B3trXAllocationVoteActivity } from "~Model"
import { MathUtils } from "~Utils"

const AppLogo = ({ appId, index }: { appId: string; index: number }) => {
    const { styles } = useThemedStyles(baseStyles)

    const { data: xApps } = useVeBetterDaoDapps()
    const xApp = useMemo(() => xApps?.find(app => app.id === appId), [xApps, appId])
    const appLogo = useAppLogo({ app: xApp, size: 32 })

    return (
        <FastImage
            source={{ uri: appLogo }}
            style={[
                styles.container as ImageStyle,
                {
                    zIndex: index,
                },
            ]}
        />
    )
}

export const StackedApps = ({ appVotes, roundId }: Pick<B3trXAllocationVoteActivity, "appVotes" | "roundId">) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const shownApps = useMemo(() => {
        if (appVotes.length <= 3) return appVotes
        const randomFn = MathUtils.deterministicRNG(parseInt(roundId, 10))
        return appVotes
            .map(vote => ({ ...vote, randomValue: randomFn() }))
            .sort((a, b) => a.randomValue - b.randomValue)
    }, [appVotes, roundId])

    return (
        <BaseView flexDirection="row">
            {shownApps.slice(0, 3).map((vote, index) => (
                <AppLogo appId={vote.appId} key={vote.appId} index={index} />
            ))}
            {appVotes.length > 3 && (
                <BaseView style={[styles.container, styles.numberContainer]}>
                    <BaseText
                        typographyFont="smallCaptionSemiBold"
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}
                        flexDirection="row">
                        +{appVotes.length - 3}
                    </BaseText>
                </BaseView>
            )}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: 24 * interpolate(PixelRatio.getFontScale(), [1, 2], [1, 1.5], Extrapolation.CLAMP),
            height: 24 * interpolate(PixelRatio.getFontScale(), [1, 2], [1, 1.5], Extrapolation.CLAMP),
            marginLeft: -4,
            borderRadius: 99,
        },
        numberContainer: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_100,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
        },
    })
