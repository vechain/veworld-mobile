import React, { useCallback, useMemo, useState } from "react"
import { WebView } from "react-native-webview"
import { generateOnRampURL } from "@coinbase/cbpay-js"
import "react-native-url-polyfill/auto"
import { useNavigation } from "@react-navigation/native"
import { VECHAIN_BLOCKCHAIN } from "./Constants/constants"
import { getErrorMessage } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
import { PlatformUtils, debug } from "~Utils"
import { BaseActivityIndicator, BaseView } from "~Components/Base"
import { StatusBar, StyleSheet } from "react-native"
import { useColorScheme } from "~Hooks"

export const CoinbasePayWebView = (props: {
    currentAmount: number
    destinationAddress: string
}) => {
    const nav = useNavigation()
    const [isLoading, setIsLoading] = useState(true)
    const coinbaseAppId = process.env.REACT_APP_COINBASE_APP_ID as string
    const systemColorScheme = useColorScheme()
    const styles = baseStyles(isLoading)

    const coinbaseURL = useMemo(() => {
        const options = {
            appId: coinbaseAppId,
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
    }, [props.currentAmount, props.destinationAddress, coinbaseAppId])

    const handleLoadEnd = useCallback(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 800)
    }, [])

    const statusBar = useMemo(() => {
        {
            return (
                <StatusBar
                    animated={true}
                    backgroundColor={
                        systemColorScheme === "dark" ? "#0a0b0d" : "#ffffff"
                    }
                    barStyle={
                        systemColorScheme === "dark"
                            ? "light-content"
                            : "dark-content"
                    }
                />
            )
        }
    }, [systemColorScheme])

    const onMessage = useCallback(
        (event: any) => {
            try {
                const { data } = JSON.parse(event.nativeEvent.data)
                if (data.eventName === "exit") {
                    setIsLoading(true)
                    nav.goBack()
                }
            } catch (error) {
                debug(getErrorMessage(error))
            }
        },
        [nav],
    )

    return (
        <BaseView style={styles.container}>
            {!isLoading && PlatformUtils.isAndroid() && statusBar}
            <BaseActivityIndicator isVisible={isLoading} onHide={() => null} />
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
