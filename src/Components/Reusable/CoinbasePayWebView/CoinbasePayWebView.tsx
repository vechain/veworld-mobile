import { useNavigation } from "@react-navigation/native"
import { useQuery } from "@tanstack/react-query"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import "react-native-url-polyfill/auto"
import { WebView, WebViewMessageEvent } from "react-native-webview"
import { generateCoinbaseOnRampURL } from "~Api/OnOffRampProviders"
import {
    BaseActivityIndicatorView,
    BaseStatusBar,
    BaseView,
    RequireUserPassword,
    useFeatureFlags,
    useInAppBrowser,
} from "~Components"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { AnalyticsEvent, ERROR_EVENTS } from "~Constants"
import { useAnalyticTracking, useCheckIdentity, useSignMessage, useSmartWallet } from "~Hooks"
import { DEVICE_TYPE } from "~Model"
import { Routes } from "~Navigation"
import { ErrorMessageUtils, HexUtils, PlatformUtils, debug, error } from "~Utils"
import { selectDevice, selectSelectedAccountOrNull, useAppSelector } from "../../../Storage/Redux"
import { SignMessageUtils } from "../../../Utils"
import { useI18nContext } from "../../../i18n/i18n-react"

const isAndroid = PlatformUtils.isAndroid()

const SIGNATURE_PREFIX = "CoinbaseSession"

export const CoinbasePayWebView = ({ destinationAddress }: { destinationAddress: string }) => {
    const nav = useNavigation()
    const [isLoading, setIsLoading] = useState(true)
    const styles = baseStyles(isLoading)
    const track = useAnalyticTracking()
    const { originWhitelist } = useInAppBrowser()
    const { paymentProvidersFeature } = useFeatureFlags()
    const { LL } = useI18nContext()

    const account = useAppSelector(selectSelectedAccountOrNull)
    const senderDevice = useAppSelector(state => selectDevice(state, account?.address))
    const { signMessage } = useSignMessage()
    const { ownerAddress } = useSmartWallet()
    // isSmartAccount is only true when ownerAddress is available,
    // keeping it consistent with resolvedDestinationAddress.
    const isSmartAccount = senderDevice?.type === DEVICE_TYPE.SMART_WALLET && !!ownerAddress

    const resolvedDestinationAddress = useMemo(() => {
        if (isSmartAccount) {
            return ownerAddress!
        }
        return destinationAddress
    }, [destinationAddress, isSmartAccount, ownerAddress])

    // State for signature and timestamp
    const [signature, setSignature] = useState<string | undefined>()
    const [timestamp, setTimestamp] = useState<number | undefined>()

    // Generate signature function
    const generateCoinbaseSignature = useCallback(
        async (password?: string) => {
            try {
                const ts = Date.now()
                const normalizedAddress = resolvedDestinationAddress.toLowerCase()
                const message = `${SIGNATURE_PREFIX}|${normalizedAddress}|${ts}`

                let sig
                if (isSmartAccount) {
                    sig = await signMessage(Buffer.from(message), password)
                } else {
                    const hash = SignMessageUtils.hashMessage(message, "eip155")
                    sig = await signMessage(hash, password)
                }

                if (!sig) {
                    throw new Error("Signature generation failed")
                }

                const sigHex = HexUtils.addPrefix(sig.toString("hex"))

                setSignature(sigHex)
                setTimestamp(ts)

                return { signature: sigHex, timestamp: ts }
            } catch (err) {
                error(ERROR_EVENTS.BUY, "Failed to generate Coinbase signature", err)
                Feedback.show({
                    severity: FeedbackSeverity.ERROR,
                    type: FeedbackType.ALERT,
                    message: LL.COINBASE_NOT_AVAILABLE(),
                    icon: "icon-alert-circle",
                })
                nav.goBack()
                throw err
            }
        },
        [resolvedDestinationAddress, signMessage, nav, LL, isSmartAccount],
    )

    // When identity is confirmed, generate signature
    const {
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        checkIdentityBeforeOpening,
        isBiometricsEmpty,
    } = useCheckIdentity({
        onIdentityConfirmed: generateCoinbaseSignature,
        allowAutoPassword: true,
    })

    // Trigger identiy check
    useEffect(() => {
        if (resolvedDestinationAddress && isBiometricsEmpty === false) {
            setSignature(undefined)
            setTimestamp(undefined)
            // Trigger authentication flow
            checkIdentityBeforeOpening()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedDestinationAddress, isBiometricsEmpty])

    const {
        data: coinbaseURL,
        isFetching: isCoinbaseLoading,
        isError,
        error: queryError,
    } = useQuery({
        queryKey: ["COINBASE", "ONRAMP", resolvedDestinationAddress, signature, timestamp],
        queryFn: () =>
            generateCoinbaseOnRampURL(
                resolvedDestinationAddress,
                paymentProvidersFeature["coinbase-pay"].url,
                signature,
                timestamp,
                isSmartAccount,
            ),
        enabled: !!signature && !!timestamp, // Only run when signature is available
        staleTime: 0,
        gcTime: 0,
        retry: false, // Don't retry on error
    })

    // Handle query errors - navigate back on error
    useEffect(() => {
        if (isError && queryError) {
            error(ERROR_EVENTS.BUY, "Coinbase URL generation failed", queryError)
            Feedback.show({
                severity: FeedbackSeverity.ERROR,
                type: FeedbackType.ALERT,
                message: LL.COINBASE_NOT_AVAILABLE(),
                icon: "icon-alert-triangle",
                duration: 3000,
            })
            // Navigate back after showing error
            setTimeout(() => {
                nav.goBack()
            }, 500)
        }
    }, [isError, queryError, nav, LL])

    const handleLoadEnd = useCallback(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 800)
    }, [])

    const onMessage = useCallback(
        (event: WebViewMessageEvent) => {
            try {
                const { data } = JSON.parse(event.nativeEvent.data)

                // if successfully completed buy process
                if (data.eventName === "success") {
                    track(AnalyticsEvent.BUY_CRYPTO_SUCCESSFULLY_COMPLETED, {
                        provider: "coinbase",
                    })
                }

                if (data.eventName === "exit") {
                    setIsLoading(true)
                    track(AnalyticsEvent.BUY_CRYPTO_CLOSED, {
                        provider: "coinbase",
                    })
                    nav.navigate(Routes.HOME)
                }

                if (data.eventName === "error") {
                    track(AnalyticsEvent.BUY_CRYPTO_FAILED, {
                        provider: "coinbase",
                    })
                }
                if (data.eventName === "open") {
                    track(AnalyticsEvent.BUY_CRYPTO_INITIALISED, {
                        provider: "coinbase",
                    })
                }
                if (data.eventName === "transition_view") {
                    track(AnalyticsEvent.BUY_CRYPTO_CREATED_ORDER, {
                        provider: "coinbase",
                    })
                }
            } catch (err) {
                debug(ERROR_EVENTS.BUY, ErrorMessageUtils.getErrorMessage(err))
            }
        },
        [nav, track],
    )

    const url = useMemo(() => {
        return isCoinbaseLoading ? undefined : coinbaseURL
    }, [coinbaseURL, isCoinbaseLoading])

    return (
        <BaseView flex={1}>
            {!isLoading && isAndroid && <BaseStatusBar />}
            {!url && <BaseActivityIndicatorView />}
            {url && (
                <WebView
                    source={{ uri: url }}
                    onLoadEnd={handleLoadEnd}
                    onMessage={onMessage}
                    style={styles.webView}
                    originWhitelist={originWhitelist}
                />
            )}
            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={handleClosePasswordModal}
                onSuccess={onPasswordSuccess}
            />
        </BaseView>
    )
}

const baseStyles = (isLoading: boolean) =>
    StyleSheet.create({
        webView: {
            flex: 1,
            opacity: isLoading ? 0 : 1,
        },
    })
