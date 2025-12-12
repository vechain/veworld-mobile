import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated, { AnimatedStyle, FadeIn, FadeOut, LinearTransition } from "react-native-reanimated"
import { useFeatureFlags } from "~Components"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent, ScanTarget, STARGATE_DAPP_URL } from "~Constants"
import { useAnalyticTracking, useBrowserNavigation, useCameraBottomSheet, useThemedStyles } from "~Hooks"
import { useTotalFiatBalance } from "~Hooks/useTotalFiatBalance"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

type Props = {
    style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
}

export const BalanceActions = ({ style }: Props) => {
    const { LL } = useI18nContext()
    const { betterWorldFeature } = useFeatureFlags()
    const { styles } = useThemedStyles(baseStyles)
    const { navigateToBrowser } = useBrowserNavigation()

    const nav = useNavigation()
    const track = useAnalyticTracking()

    const account = useAppSelector(selectSelectedAccount)

    const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
        targets: [ScanTarget.ADDRESS, ScanTarget.WALLET_CONNECT, ScanTarget.HTTPS_URL],
        sourceScreen: Routes.HOME,
    })

    const { rawAmount } = useTotalFiatBalance({ address: account.address, enabled: true })

    const onBuy = useCallback(() => {
        nav.navigate(Routes.BUY_FLOW)
        track(AnalyticsEvent.DASHBOARD_BUY_CLICK)
    }, [nav, track])

    const onSend = useCallback(() => {
        if (betterWorldFeature.balanceScreen?.send?.enabled) {
            nav.navigate(Routes.SEND_TOKEN, {})
            track(AnalyticsEvent.DASHBOARD_SEND_CLICK)
            return
        }
        nav.navigate(Routes.SELECT_TOKEN_SEND)
        track(AnalyticsEvent.DASHBOARD_SEND_CLICK)
    }, [nav, track, betterWorldFeature.balanceScreen?.send?.enabled])

    const onReceive = useCallback(() => {
        handleOpenCamera({ tabs: ["scan", "receive"], defaultTab: "receive" })
        track(AnalyticsEvent.DASHBOARD_RECEIVE_CLICK)
    }, [handleOpenCamera, track])

    const onSwap = useCallback(() => {
        nav.navigate(Routes.SWAP)
        track(AnalyticsEvent.DASHBOARD_SWAP_CLICK)
    }, [nav, track])

    const isSendDisabled = useMemo(() => rawAmount === 0, [rawAmount])

    const onEarn = useCallback(() => {
        navigateToBrowser(STARGATE_DAPP_URL, url => nav.navigate(Routes.BROWSER, { url, returnScreen: Routes.HOME }))
        track(AnalyticsEvent.DASHBOARD_EARN_CLICK)
    }, [navigateToBrowser, nav, track])

    return (
        <Animated.View
            style={[styles.root, style]}
            layout={LinearTransition.duration(1000)}
            exiting={FadeOut.duration(300)}
            entering={FadeIn.duration(300)}>
            <GlassButtonWithLabel
                label={LL.BALANCE_ACTION_RECEIVE()}
                size="sm"
                icon="icon-qr-code"
                truncateText
                typographyFont="captionSemiBold"
                onPress={onReceive}
            />
            <GlassButtonWithLabel
                label={LL.BALANCE_ACTION_SEND()}
                size="sm"
                icon="icon-arrow-up"
                onPress={onSend}
                disabled={isSendDisabled}
                typographyFont="captionSemiBold"
                truncateText
            />
            <GlassButtonWithLabel
                label={LL.SWAP()}
                size="sm"
                icon="icon-arrow-left-right"
                onPress={onSwap}
                typographyFont="captionSemiBold"
                truncateText
            />
            <GlassButtonWithLabel
                label={LL.BALANCE_ACTION_BUY()}
                size="sm"
                icon="icon-plus"
                onPress={onBuy}
                typographyFont="captionSemiBold"
                truncateText
            />
            <GlassButtonWithLabel
                label={LL.BALANCE_ACTION_EARN()}
                size="sm"
                icon={"icon-stargate"}
                onPress={onEarn}
                typographyFont="captionSemiBold"
                truncateText
            />
            {RenderCameraModal}
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            alignSelf: "center",
            flexDirection: "row",
            gap: 24,
        },
    })
