import { TransakWebView, Environments, Events, TransakConfig, EventTypes } from "@transak/react-native-sdk"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { DimensionValue, StatusBar, StyleSheet, useColorScheme } from "react-native"
import { BaseActivityIndicator, BaseView } from "~Components/Base"
import { AnalyticsEvent, COLORS } from "~Constants"
import { useAnalyticTracking, useTheme } from "~Hooks"
import { PlatformUtils } from "~Utils"
import { VECHAIN_BLOCKCHAIN } from "./Constants"

const isProd = process.env.NODE_ENV === "production"
const isAndroid = PlatformUtils.isAndroid()

export const TransakPayWebView = (props: { currentAmount: number; destinationAddress: string }) => {
    const { currentAmount, destinationAddress } = props
    const theme = useTheme()
    const track = useAnalyticTracking()
    const [isLoading, setIsLoading] = useState(true)

    const transakConfig: TransakConfig = useMemo(
        () => ({
            apiKey: process.env.REACT_APP_TRANSAK_API_KEY as string,
            walletAddress: destinationAddress,
            productsAvailed: "BUY",
            networks: VECHAIN_BLOCKCHAIN,
            defaultPaymentMethod: "credit_debit_card",
            disablePaymentMethods: "gbp_bank_transfer,inr_bank_transfer,sepa_bank_transfer",
            disableWalletAddressForm: true,
            defaultFiatCurrency: "EUR",
            defaultFiatAmount: currentAmount || 5,
            defaultNetwork: VECHAIN_BLOCKCHAIN,
            defaultCryptoCurrency: "VET",
            backgroundColors: theme.isDark ? "242226" : "ffffff",
            colorMode: theme.isDark ? "DARK" : "LIGHT",
            themeColor: theme.isDark ? "a07aff" : "28008c",
            hideMenu: true,
            environment: isProd ? Environments.PRODUCTION : Environments.STAGING,
        }),
        [currentAmount, destinationAddress, theme.isDark],
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

    const styles = baseStyles()
    const systemColorScheme = useColorScheme()

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

    return (
        <BaseView style={styles.container}>
            {!isLoading && isAndroid ? statusBar : null}
            <BaseActivityIndicator isVisible={isLoading} />
            <TransakWebView
                transakConfig={transakConfig}
                onTransakEvent={onTransakEventHandler}
                style={{ marginBottom: (isAndroid ? 10 : 30) as DimensionValue }}
            />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
    })
