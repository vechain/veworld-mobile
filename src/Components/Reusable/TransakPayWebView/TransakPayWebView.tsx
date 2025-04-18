import { Environments, EventTypes, Events, TransakConfig, TransakWebView } from "@transak/react-native-sdk"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { DimensionValue, StyleSheet } from "react-native"
import { BaseActivityIndicator, BaseButton, BaseStatusBar, BaseView } from "~Components/Base"
import { AnalyticsEvent, COLORS, ColorThemeType } from "~Constants"
import { useAnalyticTracking, useTheme, useThemedStyles } from "~Hooks"
import { PlatformUtils } from "~Utils"
import { VECHAIN_BLOCKCHAIN } from "./Constants"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { getUniqueIdSync } from "react-native-device-info"
import uuid from "react-native-uuid"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"

const isProd = process.env.NODE_ENV === "production"
const isAndroid = PlatformUtils.isAndroid()

const disabledOSProvider = isAndroid ? "apple_pay" : "google_pay,credit_debit_card"
// eslint-disable-next-line max-len
const disablePaymentMethods = `gbp_bank_transfer,inr_bank_transfer,sepa_bank_transfer,pm_cash_app,pm_us_wire_bank_transfer,${disabledOSProvider}`
const defaultPaymentMethod = isAndroid ? "google_pay" : "apple_pay"

// only for jest
const uniqueID = getUniqueIdSync ? getUniqueIdSync() : "jest-unique-id"

// using getUniqueId allows us to make the partnerOrderId really unique and unrepeatable and to track better customer orders via Mixpanel to see their flow
const partnerOrderId = `${uniqueID}-${uuid.v4().toString()}`

export const TransakPayWebView = ({
    currentAmount,
    destinationAddress,
}: {
    currentAmount: number
    destinationAddress: string
}) => {
    const { isDark } = useTheme()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const currency = useAppSelector(selectCurrency)

    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)

    const { styles } = useThemedStyles(theme => baseStyles(theme, isLoading, isProcessing))

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
                setIsProcessing(true)
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
        if (isLoading) setIsLoading(false)
    }, [isLoading])

    useEffect(() => {
        handleLoadEnd()
    }, [handleLoadEnd])

    const onButtonPress = useCallback(() => nav.navigate(Routes.BUY), [nav])

    return (
        <BaseView flex={1}>
            {!isLoading && isAndroid && <BaseStatusBar />}
            <BaseActivityIndicator isVisible={isLoading} />
            <BaseView style={styles.webviewWrapper}>
                <TransakWebView
                    transakConfig={transakConfig}
                    onTransakEvent={onTransakEventHandler}
                    style={styles.webView}
                    originWhitelist={["http://", "https://", "about:*"]}
                />
            </BaseView>
            {isProcessing && (
                <BaseView
                    bg={isLoading ? "transparent" : (transakConfig.backgroundColors as string)}
                    p={20}
                    w={100}
                    style={styles.buttonWrapper}>
                    <BaseButton
                        style={styles.button}
                        action={onButtonPress}
                        isLoading={isLoading}
                        disabled={isLoading}
                        w={100}
                        title={LL.BD_BACK_TO_APP()}
                        haptics="Success"
                    />
                </BaseView>
            )}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType, isLoading: boolean, isProcessing: boolean) =>
    StyleSheet.create({
        webviewWrapper: {
            overflow: isProcessing ? "hidden" : undefined,
            height: isProcessing ? "50%" : "100%",
            flex: 1,
        },
        webView: {
            marginTop: 10,
            marginBottom: (isAndroid ? 10 : 30) as DimensionValue,
            opacity: isLoading ? 0 : 1,
        },
        buttonWrapper: {
            position: "absolute",
            bottom: 40,
        },
        button: {
            width: "90%",
            alignSelf: "center",
        },
    })
