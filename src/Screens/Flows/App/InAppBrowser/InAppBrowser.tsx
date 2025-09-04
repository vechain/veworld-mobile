import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { MutableRefObject, useCallback, useEffect, useMemo, useState } from "react"
import { Platform, StyleSheet, View } from "react-native"
import DeviceInfo from "react-native-device-info"
import FastImage, { ImageStyle } from "react-native-fast-image"
import Animated, { Easing, FadeOut } from "react-native-reanimated"
import WebView from "react-native-webview"
import { WebViewErrorEvent, WebViewNavigationEvent } from "react-native-webview/lib/WebViewTypes"
import { BaseIcon, BaseStatusBar, BaseView, Layout, URLBar, useInAppBrowser } from "~Components"
import { AnalyticsEvent, COLORS, ColorThemeType } from "~Constants"
import { useAnalyticTracking, useGetDappMetadataFromUrl, useThemedStyles } from "~Hooks"
import { useDynamicAppLogo } from "~Hooks/useAppLogo"
import { useBrowserScreenshot } from "~Hooks/useBrowserScreenshot"
import { useI18nContext } from "~i18n"
import { RootStackParamListBrowser, Routes } from "~Navigation"
import { RootStackParamListApps } from "~Navigation/Stacks/AppsStack"
import { ChangeAccountNetworkBottomSheet } from "./Components/ChangeAccountNetworkBottomSheet"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

type Props = NativeStackScreenProps<RootStackParamListBrowser | RootStackParamListApps, Routes.BROWSER>

export const InAppBrowser: React.FC<Props> = ({ route }) => {
    const {
        webviewRef,
        onMessage,
        onScroll,
        injectVechainScript,
        onNavigationStateChange,
        resetWebViewState,
        targetAccount,
        targetNetwork,
        handleCloseChangeAccountNetworkBottomSheet,
        handleConfirmChangeAccountNetworkBottomSheet,
        ChangeAccountNetworkBottomSheetRef,
        originWhitelist,
        isLoading,
    } = useInAppBrowser()

    const track = useAnalyticTracking()
    const nav = useNavigation()
    const { locale } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [isLoadingWebView, setIsLoadingWebView] = useState(true)
    const { ref: webviewContainerRef, performScreenshot } = useBrowserScreenshot()
    const dappMetadata = useGetDappMetadataFromUrl(route.params.url)
    const fetchDynamicLogo = useDynamicAppLogo({ size: 48 })

    const iconUri = useMemo(() => {
        return dappMetadata ? fetchDynamicLogo({ app: dappMetadata }) : undefined
    }, [dappMetadata, fetchDynamicLogo])

    useEffect(() => {
        if (route?.params?.ul) {
            track(AnalyticsEvent.DAPP_UNIVERSAL_LINK_INITIATED, { isUniversalLink: route.params.url })
        }
    }, [nav, route.params?.ul, route.params.url, track])

    const [userAgent, setUserAgent] = React.useState<string | null>(null)

    useEffect(() => {
        DeviceInfo.getUserAgent().then(setUserAgent)
    }, [])

    useEffect(() => {
        // set the webview ref to undefined when the component unmounts
        return () => {
            resetWebViewState()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onLoadEnd = useCallback((e: WebViewNavigationEvent | WebViewErrorEvent) => {
        setIsLoadingWebView(e.nativeEvent.loading)
    }, [])

    const renderLoading = useCallback(() => {
        if (!dappMetadata)
            return (
                <Animated.View exiting={isIOS() ? FadeOut.duration(400) : undefined} style={[styles.loadingWebView]}>
                    <BaseView style={[styles.loadingIcon, styles.notDappLoadingIcon]}>
                        <BaseIcon name="icon-globe" size={32} color={theme.colors.history.historyItem.iconColor} />
                    </BaseView>
                </Animated.View>
            )

        return (
            <Animated.View
                exiting={isIOS() ? FadeOut.duration(400).easing(Easing.out(Easing.ease)) : undefined}
                style={[styles.loadingWebView]}>
                <FastImage
                    source={{
                        uri: iconUri,
                    }}
                    style={styles.loadingIcon as ImageStyle}
                />
            </Animated.View>
        )
    }, [
        dappMetadata,
        iconUri,
        styles.loadingIcon,
        styles.loadingWebView,
        styles.notDappLoadingIcon,
        theme.colors.history.historyItem.iconColor,
    ])

    return (
        <Layout
            bg={COLORS.DARK_PURPLE}
            fixedHeader={
                <URLBar
                    navigationUrl={route.params.url}
                    isLoading={isLoadingWebView}
                    onNavigate={performScreenshot}
                    returnScreen={route.params.returnScreen}
                />
            }
            noBackButton
            noMargin
            hasSafeArea={false}
            hasTopSafeAreaOnly
            fixedBody={
                <View style={styles.container}>
                    {Platform.OS === "ios" && <BaseStatusBar hero={true} />}
                    {userAgent && !isLoading && (
                        <Animated.View ref={webviewContainerRef} style={[styles.webviewContainer]} collapsable={false}>
                            <WebView
                                ref={webviewRef as MutableRefObject<WebView>}
                                source={{ uri: route.params.url, headers: { "Accept-Language": locale } }}
                                userAgent={userAgent}
                                onNavigationStateChange={onNavigationStateChange}
                                javaScriptEnabled={true}
                                onMessage={onMessage}
                                onScroll={onScroll}
                                onLoadEnd={onLoadEnd}
                                style={styles.loginWebView}
                                scalesPageToFit={true}
                                injectedJavaScriptBeforeContentLoaded={injectVechainScript()}
                                allowsInlineMediaPlayback={true}
                                originWhitelist={originWhitelist}
                                collapsable={false}
                                startInLoadingState={true}
                                renderLoading={renderLoading}
                            />
                        </Animated.View>
                    )}

                    <ChangeAccountNetworkBottomSheet
                        targetAccount={targetAccount}
                        targetNetwork={targetNetwork}
                        ref={ChangeAccountNetworkBottomSheetRef}
                        onClose={handleCloseChangeAccountNetworkBottomSheet}
                        onConfirm={handleConfirmChangeAccountNetworkBottomSheet}
                    />
                </View>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "flex-start",
            alignItems: "stretch",
            borderTopStartRadius: 24,
            borderTopEndRadius: 24,
            overflow: "hidden",
        },
        webviewContainer: {
            position: "relative",
            flex: 1,
        },
        loginWebView: {
            flex: 1,
            borderTopStartRadius: 24,
            borderTopEndRadius: 24,
        },
        loadingIcon: {
            width: 100,
            height: 100,
            alignSelf: "center",
            borderRadius: 8,
        },
        notDappLoadingIcon: {
            backgroundColor: theme.colors.history.historyItem.iconBackground,
            alignItems: "center",
            justifyContent: "center",
        },
        loadingWebView: {
            backgroundColor: theme.colors.tabsFooter.background,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flex: 1,
            borderTopStartRadius: 24,
            borderTopEndRadius: 24,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
        },
        errorIcon: {
            borderRadius: 999,
            padding: 16,
            backgroundColor: theme.colors.emptyStateIcon.background,
            alignSelf: "center",
        },
        errorContainer: {
            flexDirection: "column",
            gap: 24,
        },
    })
}
