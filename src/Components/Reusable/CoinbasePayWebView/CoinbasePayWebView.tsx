import React, { useCallback, useMemo } from "react"
import { WebView } from "react-native-webview"
import { generateOnRampURL } from "@coinbase/cbpay-js"
import "react-native-url-polyfill/auto"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { VECHAIN_BLOCKCHAIN } from "./Constants/constants"
import { getErrorMessage } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
import { debug } from "~Utils"

export const CoinbasePayWebView = (props: {
    currentAmount: number
    destinationAddress: string
}) => {
    const nav = useNavigation()
    const coinbaseAppId = process.env.REACT_APP_COINBASE_APP_ID as string

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

    const onMessage = useCallback(
        (event: any) => {
            try {
                const { data } = JSON.parse(event.nativeEvent.data)
                if (data.eventName === "exit") {
                    nav.navigate(Routes.HOME)
                }
            } catch (error) {
                debug(getErrorMessage(error))
            }
        },
        [nav],
    )

    return <WebView source={{ uri: coinbaseURL }} onMessage={onMessage} />
}
