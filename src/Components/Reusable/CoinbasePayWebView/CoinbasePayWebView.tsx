import { useNavigation } from "@react-navigation/native"
import { useQuery } from "@tanstack/react-query"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import "react-native-url-polyfill/auto"
import { WebView, WebViewMessageEvent } from "react-native-webview"
import { generateCoinbaseOnRampURL } from "~Api/OnOffRampProviders"
import { BaseActivityIndicator, BaseStatusBar, BaseView, useInAppBrowser } from "~Components"
import { AnalyticsEvent, ERROR_EVENTS } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { Routes } from "~Navigation"
import { ErrorMessageUtils, PlatformUtils, debug } from "~Utils"

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

    const { data: coinbaseURL, isLoading: isCoinbaseLoading } = useQuery({
        queryKey: ["COINBASE", "ONRAMP", destinationAddress, currentAmount],
        queryFn: () => generateCoinbaseOnRampURL(destinationAddress),
        staleTime: 0,
        gcTime: 0,
    })

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

    const url = useMemo(() => {
        return isCoinbaseLoading ? undefined : coinbaseURL
    }, [coinbaseURL, isCoinbaseLoading])

    return (
        <BaseView flex={1}>
            {!isLoading && isAndroid && <BaseStatusBar />}
            <BaseActivityIndicator isVisible={isLoading} />
            {url && (
                <WebView
                    source={{ uri: url }}
                    onLoadEnd={handleLoadEnd}
                    onMessage={onMessage}
                    style={styles.webView}
                    originWhitelist={originWhitelist}
                />
            )}
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
