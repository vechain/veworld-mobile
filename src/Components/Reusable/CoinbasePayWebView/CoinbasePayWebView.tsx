import React, { useCallback, useMemo, useState } from "react"
import { WebView, WebViewMessageEvent } from "react-native-webview"
import { generateOnRampURL } from "@coinbase/cbpay-js"
import "react-native-url-polyfill/auto"
import { useNavigation } from "@react-navigation/native"
import { VECHAIN_BLOCKCHAIN } from "./Constants"
import { PlatformUtils, debug, ErrorMessageUtils } from "~Utils"
import { BaseActivityIndicator, BaseView } from "~Components"
import { StatusBar, StyleSheet } from "react-native"
import { useAnalyticTracking, useColorScheme } from "~Hooks"
import { Routes } from "~Navigation"
import { AnalyticsEvent, COLORS, ERROR_EVENTS } from "~Constants"

export const CoinbasePayWebView = (props: { currentAmount: number; destinationAddress: string }) => {
    const nav = useNavigation()
    const [isLoading, setIsLoading] = useState(true)
    const systemColorScheme = useColorScheme()
    const styles = baseStyles(isLoading)
    const track = useAnalyticTracking()

    const coinbaseURL = useMemo(() => {
        const options = {
            appId: process.env.REACT_APP_COINBASE_APP_ID as string,
            destinationWallets: [
                {
                    address: props.destinationAddress,
                    blockchains: [VECHAIN_BLOCKCHAIN],
                },
            ],
            handlingRequestedUrls: true,
            presetCryptoAmount: props.currentAmount,
        }

        return generateOnRampURL(options)
    }, [props.currentAmount, props.destinationAddress])

    const handleLoadEnd = useCallback(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 800)
    }, [])

    const statusBar = useMemo(() => {
        return (
            <StatusBar
                animated={true}
                backgroundColor={
                    systemColorScheme === "dark" ? COLORS.COINBASE_BACKGROUND_DARK : COLORS.COINBASE_BACKGROUND_LIGHT
                }
                barStyle={systemColorScheme === "dark" ? "light-content" : "dark-content"}
            />
        )
    }, [systemColorScheme])

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
        <BaseView style={styles.container}>
            {!isLoading && PlatformUtils.isAndroid() ? statusBar : null}
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
        container: {
            flex: 1,
        },
        webView: {
            flex: 1,
            opacity: isLoading ? 0 : 1,
        },
    })
