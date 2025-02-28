import React, { useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import WebView, { WebViewMessageEvent } from "react-native-webview"
import { BaseActivityIndicator, BaseStatusBar, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { debug, ErrorMessageUtils, PlatformUtils } from "~Utils"
import { useCoinifyPay } from "./Hooks"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AnalyticsEvent, ERROR_EVENTS } from "~Constants"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

const isAndroid = PlatformUtils.isAndroid()

export const CoinifyPayWebView = ({
    currentAmount,
    destinationAddress,
    target,
}: {
    currentAmount: number
    destinationAddress: string
    target: "buy" | "sell"
}) => {
    const [isLoading, setIsLoading] = useState(true)
    const { styles } = useThemedStyles(() => baseStyles(isLoading))
    const track = useAnalyticTracking()
    const nav = useNavigation()
    const { originWhitelist } = useInAppBrowser()
    const { generateOnRampURL } = useCoinifyPay({ target })

    const currency = useAppSelector(selectCurrency)

    const coinifyUrl = generateOnRampURL({
        address: destinationAddress,
        buyAmount: currentAmount,
        defaultCryptoCurrency: "VET",
        defaultFiatCurrency: currency,
        primaryColor: "red",
    })

    const handleLoadEnd = useCallback(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 400)
    }, [])

    const onMessage = useCallback(
        (event: WebViewMessageEvent) => {
            try {
                const { data } = JSON.parse(event.nativeEvent.data)

                // if successfully completed buy process
                if (data.eventName === "success") {
                    track(AnalyticsEvent.BUY_CRYPTO_SUCCESSFULLY_COMPLETED, {
                        provider: "coinify",
                    })
                }

                if (data.eventName === "exit") {
                    setIsLoading(true)
                    track(AnalyticsEvent.BUY_CRYPTO_CLOSED, {
                        provider: "coinify",
                    })
                    nav.navigate(Routes.HOME)
                }

                if (data.eventName === "error") {
                    track(AnalyticsEvent.BUY_CRYPTO_FAILED, {
                        provider: "coinify",
                    })
                }
            } catch (error) {
                debug(ERROR_EVENTS.BUY, ErrorMessageUtils.getErrorMessage(error))
            }
        },
        [nav, track],
    )

    return (
        <BaseView flex={1}>
            {!isLoading && isAndroid && <BaseStatusBar />}
            <BaseActivityIndicator isVisible={isLoading} />
            <WebView
                source={{ uri: coinifyUrl }}
                onLoadEnd={handleLoadEnd}
                onMessage={onMessage}
                style={styles.webView}
                originWhitelist={originWhitelist}
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
