import { Environments, EventTypes, Events, TransakConfig, TransakWebView } from "@transak/react-native-sdk"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { DimensionValue, StyleSheet } from "react-native"
import { BaseActivityIndicator, BaseStatusBar, BaseView } from "~Components/Base"
import { AnalyticsEvent, COLORS } from "~Constants"
import { useAnalyticTracking, useTheme } from "~Hooks"
import { PlatformUtils } from "~Utils"
import { VECHAIN_BLOCKCHAIN } from "./Constants"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { getUniqueIdSync } from "react-native-device-info"
import { v4 as uuid } from "uuid"

const isProd = process.env.NODE_ENV === "production"
const isAndroid = PlatformUtils.isAndroid()

// first google_pay for isAndroid is temporary, wait for a SDK fix
const disabledOSProvider = isAndroid ? "apple_pay,google_pay" : "google_pay,credit_debit_card"
// eslint-disable-next-line max-len
const disablePaymentMethods = `gbp_bank_transfer,inr_bank_transfer,sepa_bank_transfer,pm_cash_app,pm_jwire,${disabledOSProvider}`
const defaultPaymentMethod = isAndroid ? "credit_debit_card" : "apple_pay"

// using getUniqueId allows us to make the partnerOrderId really unique and unrepeatable and to track better customer orders via Mixpanel to see their flow
const partnerOrderId = getUniqueIdSync() + "-" + uuid()

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
    const currency = useAppSelector(selectCurrency)

    const { backgroundColors, themeColor } = useMemo(() => {
        const bg = isDark ? COLORS.DARK_PURPLE : COLORS.LIGHT_GRAY
        const tc = isDark ? COLORS.LIGHT_PURPLE : COLORS.DARK_PURPLE
        return { backgroundColors: bg, themeColor: tc.replace("#", "") }
    }, [isDark])

    const transakConfig: TransakConfig = useMemo(
        () => ({
            apiKey: process.env.REACT_APP_TRANSAK_API_KEY as string,
            partnerOrderId,
            walletAddress: destinationAddress,
            productsAvailed: "BUY",
            networks: VECHAIN_BLOCKCHAIN,
            defaultPaymentMethod,
            disablePaymentMethods,
            disableWalletAddressForm: true,
            defaultFiatCurrency: currency,
            defaultFiatAmount: currentAmount || 5,
            defaultNetwork: VECHAIN_BLOCKCHAIN,
            defaultCryptoCurrency: "VET",
            backgroundColors,
            colorMode: isDark ? "DARK" : "LIGHT",
            themeColor,
            hideMenu: true,
            environment: isProd ? Environments.PRODUCTION : Environments.STAGING,
        }),
        [backgroundColors, currency, currentAmount, destinationAddress, isDark, themeColor],
    )

    const onTransakEventHandler = (event: EventTypes) => {
        switch (event) {
            case Events.ORDER_CREATED:
                track(AnalyticsEvent.BUY_CRYPTO_CREATED_ORDER, {
                    provider: "transak",
                    partnerOrderId,
                })
                break

            case Events.ORDER_PROCESSING:
                track(AnalyticsEvent.BUY_CRYPTO_SUCCESSFULLY_COMPLETED, {
                    provider: "transak",
                    partnerOrderId,
                })
                break

            case Events.ORDER_FAILED:
                track(AnalyticsEvent.BUY_CRYPTO_FAILED, {
                    provider: "transak",
                    partnerOrderId,
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
                enableApplePay
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
