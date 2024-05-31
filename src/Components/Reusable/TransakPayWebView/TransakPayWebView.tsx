import { Environments, EventTypes, Events, TransakConfig, TransakWebView } from "@transak/react-native-sdk"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { DimensionValue, StyleSheet } from "react-native"
import { BaseActivityIndicator, BaseStatusBar, BaseView } from "~Components/Base"
import { AnalyticsEvent, COLORS } from "~Constants"
import { useAnalyticTracking, useTheme } from "~Hooks"
import { PlatformUtils } from "~Utils"
import { VECHAIN_BLOCKCHAIN } from "./Constants"

const isProd = process.env.NODE_ENV === "production"
const isAndroid = PlatformUtils.isAndroid()

const disabledOSProvider = isAndroid ? "apple_pay" : "google_pay"
const disablePaymentMethods = `gbp_bank_transfer,inr_bank_transfer,sepa_bank_transfer,${disabledOSProvider}`

export const TransakPayWebView = ({
    currentAmount,
    destinationAddress,
}: {
    currentAmount: number
    destinationAddress: string
}) => {
    const { isDark } = useTheme()
    const track = useAnalyticTracking()
    const [isLoading, setIsLoading] = useState(true)
    const styles = baseStyles(isLoading)

    const { backgroundColors, themeColor } = useMemo(() => {
        const bg = isDark ? COLORS.DARK_PURPLE : COLORS.LIGHT_GRAY
        const tc = isDark ? COLORS.LIGHT_PURPLE : COLORS.DARK_PURPLE
        return { backgroundColors: bg, themeColor: tc.replace("#", "") }
    }, [isDark])

    const transakConfig: TransakConfig = useMemo(
        () => ({
            apiKey: process.env.REACT_APP_TRANSAK_API_KEY as string,
            walletAddress: destinationAddress,
            productsAvailed: "BUY",
            networks: VECHAIN_BLOCKCHAIN,
            defaultPaymentMethod: "credit_debit_card",
            disablePaymentMethods,
            disableWalletAddressForm: true,
            defaultFiatCurrency: "EUR",
            defaultFiatAmount: currentAmount || 5,
            defaultNetwork: VECHAIN_BLOCKCHAIN,
            defaultCryptoCurrency: "VET",
            backgroundColors,
            colorMode: isDark ? "DARK" : "LIGHT",
            themeColor,
            hideMenu: true,
            environment: isProd ? Environments.PRODUCTION : Environments.STAGING,
        }),
        [backgroundColors, currentAmount, destinationAddress, isDark, themeColor],
    )

    const onTransakEventHandler = (event: EventTypes) => {
        switch (event) {
            case Events.ORDER_PROCESSING:
                track(AnalyticsEvent.BUY_CRYPTO_INITIALISED, {
                    provider: "transak",
                })
                break

            case Events.ORDER_CREATED:
                track(AnalyticsEvent.BUY_CRYPTO_CREATED_ORDER, {
                    provider: "transak",
                })
                break

            case Events.ORDER_COMPLETED:
                track(AnalyticsEvent.BUY_CRYPTO_SUCCESSFULLY_COMPLETED, {
                    provider: "transak",
                })
                break

            case Events.ORDER_FAILED:
                track(AnalyticsEvent.BUY_CRYPTO_FAILED, {
                    provider: "transak",
                })
                break
        }
    }

    const handleLoadEnd = useCallback(() => {
        setTimeout(() => {
            if (isLoading) setIsLoading(false)
        }, 1000)
    }, [isLoading])

    useEffect(() => {
        handleLoadEnd()
    }, [handleLoadEnd])

    return (
        <BaseView flex={1}>
            {!isLoading && isAndroid && <BaseStatusBar />}
            <BaseActivityIndicator isVisible={isLoading} />
            <TransakWebView
                transakConfig={transakConfig}
                onTransakEvent={onTransakEventHandler}
                style={styles.webView}
            />
        </BaseView>
    )
}

const baseStyles = (isLoading: boolean) =>
    StyleSheet.create({
        webView: {
            marginTop: 10,
            marginBottom: (isAndroid ? 10 : 30) as DimensionValue,
            opacity: isLoading ? 0 : 1,
        },
    })
