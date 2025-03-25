import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import WebView, { WebViewMessageEvent } from "react-native-webview"
import { BaseActivityIndicator, BaseStatusBar, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers"
import { AnalyticsEvent, COLORS, ERROR_EVENTS, VET } from "~Constants"
import { useAnalyticTracking, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils, debug, ErrorMessageUtils, PlatformUtils } from "~Utils"
import { toUppercase } from "~Utils/StringUtils/StringUtils"
import { AnimatedFloatingButton } from "../AnimatedFloatingButton"
import { useCoinifyPay } from "./Hooks"

const isAndroid = PlatformUtils.isAndroid()

const injectedJs = `
window.postMessage = function(data) {
       window.ReactNativeWebView.postMessage(JSON.stringify(data));
}
`.trim()

type FloatingTxData = RootStackParamListHome[Routes.TRANSACTION_SUMMARY_SEND]

export const CoinifyPayWebView = ({
    currentAmount,
    destinationAddress,
    target,
}: {
    currentAmount: number
    destinationAddress: string
    target: "buy" | "sell" | "trade-history"
}) => {
    const { LL } = useI18nContext()
    const [isLoading, setIsLoading] = useState(true)
    const { styles } = useThemedStyles(() => baseStyles(isLoading))
    const track = useAnalyticTracking()
    const { originWhitelist } = useInAppBrowser()
    const { generateOnRampURL, generateOffRampURL, generateTradeHistoryURL } = useCoinifyPay({ target })
    const [floatingTxData, setFloatingTxData] = useState<FloatingTxData>()

    const nav = useNavigation()

    const VET_FULL = useTokenWithCompleteInfo(VET)

    const showFloatingSign = useMemo(() => typeof floatingTxData !== "undefined", [floatingTxData])

    const currency = useAppSelector(selectCurrency)

    const url = useMemo(() => {
        switch (target) {
            case "buy":
                return generateOnRampURL({
                    address: destinationAddress,
                    amount: currentAmount,
                    defaultCryptoCurrency: "VET",
                    defaultFiatCurrency: currency,
                    primaryColor: COLORS.PURPLE,
                })
            case "sell":
                return generateOffRampURL({
                    address: destinationAddress,
                    amount: currentAmount,
                    defaultCryptoCurrency: "VET",
                    defaultFiatCurrency: currency,
                    primaryColor: COLORS.PURPLE,
                })
            case "trade-history":
                return generateTradeHistoryURL({ primaryColor: COLORS.PURPLE })
        }
    }, [
        currency,
        currentAmount,
        destinationAddress,
        generateOffRampURL,
        generateOnRampURL,
        generateTradeHistoryURL,
        target,
    ])

    const handleLoadEnd = () => {
        setTimeout(() => {
            setIsLoading(false)
        }, 400)
    }

    const onFloatingActionPressed = useCallback(() => {
        if (!floatingTxData) return
        nav.navigate(Routes.TRANSACTION_SUMMARY_SEND, {
            ...floatingTxData,
            navigation: {
                route: Routes.SELL_FLOW,
                params: {
                    provider: "coinify",
                },
                screen: Routes.SELL_TRADE_HISTORY,
            },
        })
    }, [floatingTxData, nav])

    const onMessage = useCallback(
        (event: WebViewMessageEvent) => {
            if (target === "trade-history") return
            try {
                const data = JSON.parse(event.nativeEvent.data)

                if (target === "sell" && data.event === "trade.trade-created") {
                    setFloatingTxData({
                        address: data.context.transferIn.details.account,
                        amount: BigNutils(data.context.transferIn.sendAmount).toString,
                        token: VET_FULL as FungibleTokenWithBalance,
                    })
                }

                // if successfully completed buy process
                if (data.event === "trade.trade-placed") {
                    setFloatingTxData(undefined)
                    track(AnalyticsEvent[`${toUppercase(target)}_CRYPTO_SUCCESSFULLY_COMPLETED`], {
                        provider: "coinify",
                    })
                }
            } catch (error) {
                if (error) debug(ERROR_EVENTS[toUppercase(target)], ErrorMessageUtils.getErrorMessage(error))
            }
        },
        [VET_FULL, target, track],
    )

    return (
        <BaseView flex={1}>
            {!isLoading && isAndroid && <BaseStatusBar />}
            <BaseActivityIndicator isVisible={isLoading} />
            <WebView
                testID="CoinifyPayWebView"
                source={{ uri: url }}
                onLoadEnd={handleLoadEnd}
                onMessage={onMessage}
                style={styles.webView}
                originWhitelist={originWhitelist}
                injectedJavaScript={injectedJs}
            />

            <AnimatedFloatingButton
                isVisible={showFloatingSign}
                title={LL.SIGN_TRANSACTION()}
                onPress={onFloatingActionPressed}
            />
        </BaseView>
    )
}

const baseStyles = (isLoading: boolean) =>
    StyleSheet.create({
        webView: {
            flex: 1,
            opacity: isLoading ? 0 : 1,
        },
    })
