import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated, { AnimatedStyle, FadeIn, FadeOut, LinearTransition } from "react-native-reanimated"
import { AnalyticsEvent, ScanTarget, STARGATE_DAPP_URL } from "~Constants"
import { useAnalyticTracking, useBrowserNavigation, useCameraBottomSheet, useThemedStyles } from "~Hooks"
import { useTotalFiatBalance } from "~Hooks/useTotalFiatBalance"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { GlassButtonWithLabel } from "./GlassButton"

type Props = {
    style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
}

export const BalanceActions = ({ style }: Props) => {
    const { LL } = useI18nContext()

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
        track(AnalyticsEvent.BUY_CRYPTO_BUTTON_CLICKED)
    }, [nav, track])

    const onSend = useCallback(() => nav.navigate(Routes.SELECT_TOKEN_SEND), [nav])

    const onReceive = useCallback(
        () => handleOpenCamera({ tabs: ["scan", "receive"], defaultTab: "receive" }),
        [handleOpenCamera],
    )

    const onSwap = useCallback(() => nav.navigate(Routes.SWAP), [nav])

    const onEarn = useCallback(
        () =>
            navigateToBrowser(STARGATE_DAPP_URL, url =>
                nav.navigate(Routes.BROWSER, { url, returnScreen: Routes.HOME }),
            ),
        [navigateToBrowser, nav],
    )

    const isSendDisabled = useMemo(() => rawAmount === 0, [rawAmount])

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
                onPress={onReceive}
            />
            <GlassButtonWithLabel
                label={LL.BALANCE_ACTION_SEND()}
                size="sm"
                icon="icon-arrow-up"
                onPress={onSend}
                disabled={isSendDisabled}
            />
            <GlassButtonWithLabel label={LL.SWAP()} size="sm" icon="icon-arrow-left-right" onPress={onSwap} />
            <GlassButtonWithLabel label={LL.BALANCE_ACTION_BUY()} size="sm" icon="icon-plus" onPress={onBuy} />
            <GlassButtonWithLabel label={LL.BALANCE_ACTION_EARN()} size="sm" icon={"icon-stargate"} onPress={onEarn} />
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
