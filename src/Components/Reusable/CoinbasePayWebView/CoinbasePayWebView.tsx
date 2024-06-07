import { generateOnRampURL } from "@coinbase/cbpay-js"
import { useNavigation, useTheme } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import "react-native-url-polyfill/auto"
import { WebView, WebViewMessageEvent } from "react-native-webview"
import { BaseActivityIndicator, BaseStatusBar, BaseView } from "~Components"
import { AnalyticsEvent, ERROR_EVENTS } from "~Constants"
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

    const { dark } = useTheme()

    const coinbaseURL = useMemo(() => {
        const options: GenerateOnRampURLOptions = {
            appId: process.env.REACT_APP_COINBASE_APP_ID as string,
            destinationWallets: [
                {
                    address: destinationAddress,
                    blockchains: [VECHAIN_BLOCKCHAIN],
                },
            ],
            handlingRequestedUrls: true,
            presetCryptoAmount: currentAmount,
            theme: dark ? "dark" : "light",
        }

        return generateOnRampURL(options)
    }, [currentAmount, destinationAddress, dark])

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
                    track(AnalyticsEvent.BUY_CRYPTO_SUCCESSFULLY_COMPLETED)
                }

                if (data.eventName === "exit") {
                    setIsLoading(true)
                    nav.navigate(Routes.HOME)
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
