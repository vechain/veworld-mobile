import { generateOnRampURL } from "@coinbase/cbpay-js"
import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import "react-native-url-polyfill/auto"
import { WebView, WebViewMessageEvent } from "react-native-webview"
import { BaseActivityIndicator, BaseStatusBar, BaseView, useInAppBrowser } from "~Components"
import { AnalyticsEvent, ERROR_EVENTS, VET, VTHO } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { Routes } from "~Navigation"
import { ErrorMessageUtils, PlatformUtils, debug } from "~Utils"
import { VECHAIN_BLOCKCHAIN } from "./Constants"

type GenerateOnRampURLOptions = Parameters<typeof generateOnRampURL>[0]

const isAndroid = PlatformUtils.isAndroid()

export const CoinbasePayWebView = ({
    currentAmount,
    destinationAddress,
}: {
    currentAmount: number
    destinationAddress: string
}) => {
    const nav = useNavigation()
    const [isLoading, setIsLoading] = useState(true)
    const styles = baseStyles(isLoading)
    const track = useAnalyticTracking()
    const { originWhitelist } = useInAppBrowser()

    const coinbaseURL = useMemo(() => {
        const options: GenerateOnRampURLOptions = {
            appId: process.env.REACT_APP_COINBASE_APP_ID as string,
            addresses: {
                [destinationAddress]: [VECHAIN_BLOCKCHAIN],
            },
            assets: [VET.symbol, VTHO.symbol],
            handlingRequestedUrls: true,
            presetCryptoAmount: currentAmount,
        }

        return generateOnRampURL(options)
    }, [currentAmount, destinationAddress])

    const handleLoadEnd = useCallback(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 800)
    }, [])

    const onMessage = useCallback(
        (event: WebViewMessageEvent) => {
            try {
                const { data } = JSON.parse(event.nativeEvent.data)

                // if successfully completed buy process
                if (data.eventName === "success") {
                    track(AnalyticsEvent.BUY_CRYPTO_SUCCESSFULLY_COMPLETED, {
                        provider: "coinbase",
                    })
                }

                if (data.eventName === "exit") {
                    setIsLoading(true)
                    track(AnalyticsEvent.BUY_CRYPTO_CLOSED, {
                        provider: "coinbase",
                    })
                    nav.navigate(Routes.HOME)
                }

                if (data.eventName === "error") {
                    track(AnalyticsEvent.BUY_CRYPTO_FAILED, {
                        provider: "coinbase",
                    })
                }
                if (data.eventName === "open") {
                    track(AnalyticsEvent.BUY_CRYPTO_INITIALISED, {
                        provider: "coinbase",
                    })
                }
                if (data.eventName === "transition_view") {
                    track(AnalyticsEvent.BUY_CRYPTO_CREATED_ORDER, {
                        provider: "coinbase",
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
                source={{ uri: coinbaseURL }}
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
