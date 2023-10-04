import React, { useCallback, useMemo, useState } from "react"
import { WebView, WebViewMessageEvent } from "react-native-webview"
import { generateOnRampURL } from "@coinbase/cbpay-js"
import "react-native-url-polyfill/auto"
import { useNavigation } from "@react-navigation/native"
import { COINBASE_APP_ID, VECHAIN_BLOCKCHAIN } from "./Constants"
import { PlatformUtils, debug, ErrorMessageUtils } from "~Utils"
import { BaseActivityIndicator, BaseView } from "~Components"
import { StatusBar, StyleSheet } from "react-native"
import { useColorScheme } from "~Hooks"
import { Routes } from "~Navigation"
import { COLORS } from "~Constants"

export const CoinbasePayWebView = (props: {
    currentAmount: number
    destinationAddress: string
}) => {
    const nav = useNavigation()
    const [isLoading, setIsLoading] = useState(true)
    const systemColorScheme = useColorScheme()
    const styles = baseStyles(isLoading)

    const coinbaseURL = useMemo(() => {
        const options = {
            appId: COINBASE_APP_ID,
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
                    systemColorScheme === "dark"
                        ? COLORS.COINBASE_BACKGROUND_DARK
                        : COLORS.COINBASE_BACKGROUND_LIGHT
                }
                barStyle={
                    systemColorScheme === "dark"
                        ? "light-content"
                        : "dark-content"
                }
            />
        )
    }, [systemColorScheme])

    const onMessage = useCallback(
        (event: WebViewMessageEvent) => {
            try {
                const { data } = JSON.parse(event.nativeEvent.data)
                if (data.eventName === "exit") {
                    setIsLoading(true)
                    nav.navigate(Routes.HOME)
                }
            } catch (error) {
                debug(ErrorMessageUtils.getErrorMessage(error))
            }
        },
        [nav],
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
