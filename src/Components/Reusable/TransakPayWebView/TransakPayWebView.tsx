import { useNavigation } from "@react-navigation/native"
import { useQuery } from "@tanstack/react-query"
import { Events, TransakWebView } from "@transak/ui-react-native-sdk"
import React, { useCallback, useMemo, useState } from "react"
import { DimensionValue, StyleSheet } from "react-native"
import { generateTransakOnRampURL } from "~Api/OnOffRampProviders"
import { BaseActivityIndicator, BaseButton, BaseStatusBar, BaseView } from "~Components/Base"
import { useFeatureFlags } from "~Components/Providers"
import { AnalyticsEvent, COLORS, ColorThemeType, ThemeEnum } from "~Constants"
import { useAnalyticTracking, useSmartWallet, useTheme, useThemedStyles } from "~Hooks"
import { DEVICE_TYPE } from "~Model"
import { Routes } from "~Navigation"
import { selectCurrency, selectDevice, selectSelectedAccountOrNull, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import { useI18nContext } from "~i18n"

export const TransakPayWebView = ({ destinationAddress }: { currentAmount: number; destinationAddress: string }) => {
    const { isDark } = useTheme()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const currency = useAppSelector(selectCurrency)

    const [isProcessing, setIsProcessing] = useState(false)

    const account = useAppSelector(selectSelectedAccountOrNull)
    const { smartAccountAddress } = useSmartWallet()

    const senderDevice = useAppSelector(state => selectDevice(state, account?.address))
    const resolvedDestinationAddress = useMemo(() => {
        if (senderDevice?.type === DEVICE_TYPE.SMART_WALLET && smartAccountAddress) {
            return smartAccountAddress
        }
        return destinationAddress
    }, [destinationAddress, senderDevice?.type, smartAccountAddress])

    const { paymentProvidersFeature } = useFeatureFlags()

    const bgColor = useMemo(() => {
        return isDark ? COLORS.DARK_PURPLE : COLORS.LIGHT_GRAY
    }, [isDark])

    const { data: transakRes, isFetching: isLoadingQuery } = useQuery({
        queryKey: ["TRANSAK", "ONRAMP", resolvedDestinationAddress],
        queryFn: () =>
            generateTransakOnRampURL(
                resolvedDestinationAddress,
                paymentProvidersFeature.transak.url,
                currency,
                isDark ? ThemeEnum.DARK : ThemeEnum.LIGHT,
            ),
        staleTime: 0,
        gcTime: 1,
        networkMode: "online",
        retry: 3,
        meta: {
            persisted: false,
        },
    })

    const { styles } = useThemedStyles(theme => baseStyles(theme, isLoadingQuery, isProcessing))

    const onTransakEventHandler = (event: Events) => {
        switch (event) {
            case Events.TRANSAK_ORDER_CREATED:
                track(AnalyticsEvent.BUY_CRYPTO_CREATED_ORDER, {
                    provider: "transak",
                    partnerOrderId: transakRes?.partnerOrderId,
                })
                break

            case Events.TRANSAK_ORDER_SUCCESSFUL:
                track(AnalyticsEvent.BUY_CRYPTO_SUCCESSFULLY_COMPLETED, {
                    provider: "transak",
                    partnerOrderId: transakRes?.partnerOrderId,
                })
                setIsProcessing(true)
                break

            case Events.TRANSAK_ORDER_FAILED:
                track(AnalyticsEvent.BUY_CRYPTO_FAILED, {
                    provider: "transak",
                    partnerOrderId: transakRes?.partnerOrderId,
                })
                break
        }
    }

    const onButtonPress = useCallback(() => nav.navigate(Routes.BUY), [nav])
    const config = useMemo(() => {
        if (!transakRes?.url) return
        return { widgetUrl: transakRes?.url }
    }, [transakRes])

    return (
        <BaseView flex={1}>
            {!isLoadingQuery && PlatformUtils.isAndroid() && <BaseStatusBar />}
            <BaseActivityIndicator isVisible={isLoadingQuery} />
            <BaseView style={styles.webviewWrapper}>
                {config && (
                    <TransakWebView
                        transakConfig={config}
                        onTransakEvent={onTransakEventHandler}
                        style={styles.webView}
                        originWhitelist={["http://", "https://", "about:*"]}
                    />
                )}
            </BaseView>
            {isProcessing && (
                <BaseView bg={isLoadingQuery ? "transparent" : bgColor} p={20} w={100} style={styles.buttonWrapper}>
                    <BaseButton
                        style={styles.button}
                        action={onButtonPress}
                        isLoading={isLoadingQuery}
                        disabled={isLoadingQuery}
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
            marginBottom: (PlatformUtils.isAndroid() ? 10 : 30) as DimensionValue,
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
