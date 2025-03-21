import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import WebView, { WebViewMessageEvent } from "react-native-webview"
import { BaseActivityIndicator, BaseStatusBar, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers"
import { AnalyticsEvent, COLORS, ERROR_EVENTS } from "~Constants"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { debug, ErrorMessageUtils, PlatformUtils } from "~Utils"
import { toUppercase } from "~Utils/StringUtils/StringUtils"
import { useCoinifyPay } from "./Hooks"

const isAndroid = PlatformUtils.isAndroid()

const injectedJs = `
window.postMessage = function(data) {
       window.ReactNativeWebView.postMessage(JSON.stringify(data));
}
`.trim()

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
    const { originWhitelist } = useInAppBrowser()
    const { generateOnRampURL, generateOffRampURL } = useCoinifyPay({ target })

    const currency = useAppSelector(selectCurrency)

    const url = useMemo(() => {
        if (target === "buy")
            return generateOnRampURL({
                address: destinationAddress,
                amount: currentAmount,
                defaultCryptoCurrency: "VET",
                defaultFiatCurrency: currency,
                primaryColor: COLORS.PURPLE,
            })

        return generateOffRampURL({
            address: destinationAddress,
            amount: currentAmount,
            defaultCryptoCurrency: "VET",
            defaultFiatCurrency: currency,
            primaryColor: COLORS.PURPLE,
        })
    }, [currency, currentAmount, destinationAddress, generateOffRampURL, generateOnRampURL, target])

    const handleLoadEnd = () => {
        setTimeout(() => {
            setIsLoading(false)
        }, 400)
    }

    const onMessage = useCallback(
        (event: WebViewMessageEvent) => {
            try {
                const data = JSON.parse(event.nativeEvent.data)

                // if successfully completed buy process
                if (data.event === "trade.trade-placed") {
                    track(AnalyticsEvent[`${toUppercase(target)}_CRYPTO_SUCCESSFULLY_COMPLETED`], {
                        provider: "coinify",
                    })
                }
            } catch (error) {
                if (error) debug(ERROR_EVENTS[toUppercase(target)], ErrorMessageUtils.getErrorMessage(error))
            }
        },
        [target, track],
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
