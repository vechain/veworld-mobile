import { useNavigation } from "@react-navigation/native"
import { useQuery } from "@tanstack/react-query"
import { Events, TransakWebView } from "@transak/ui-react-native-sdk"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { DimensionValue, StyleSheet } from "react-native"
import { generateTransakOnRampURL } from "~Api/OnOffRampProviders"
import { BaseActivityIndicator, BaseButton, BaseStatusBar, BaseView } from "~Components/Base"
import { useFeatureFlags } from "~Components/Providers"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { AnalyticsEvent, COLORS, ColorThemeType, ERROR_EVENTS, ThemeEnum } from "~Constants"
import { useAnalyticTracking, useSmartWallet, useTheme, useThemedStyles } from "~Hooks"
import { DEVICE_TYPE } from "~Model"
import { Routes } from "~Navigation"
import { selectCurrency, selectDevice, selectSelectedAccountOrNull, useAppSelector } from "~Storage/Redux"
import { error, PlatformUtils } from "~Utils"
import { useI18nContext } from "~i18n"

export const TransakPayWebView = ({ destinationAddress }: { destinationAddress: string }) => {
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

    const {
        data: transakRes,
        isFetching: isLoadingQuery,
        isError,
    } = useQuery({
        queryKey: ["TRANSAK", "ONRAMP", resolvedDestinationAddress],
        queryFn: () =>
            generateTransakOnRampURL(
                resolvedDestinationAddress,
                currency,
                isDark ? ThemeEnum.DARK : ThemeEnum.LIGHT,
                paymentProvidersFeature.transak.url,
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

    useEffect(() => {
        if (!isError) return
        error(ERROR_EVENTS.BUY, "Transak URL generation failed")
        Feedback.show({
            severity: FeedbackSeverity.ERROR,
            message: LL.TRANSAK_NOT_AVAILABLE(),
            type: FeedbackType.ALERT,
        })
        const timeoutId = setTimeout(() => {
            nav.goBack()
        }, 500)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [LL, isError, nav])

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
