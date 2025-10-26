import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { MutableRefObject, default as React, useCallback, useEffect, useMemo, useState } from "react"
import { BackHandler, Platform, StyleSheet, View } from "react-native"
import DeviceInfo from "react-native-device-info"
import Animated, { Easing, FadeOut } from "react-native-reanimated"
import WebView from "react-native-webview"
import { WebViewErrorEvent, WebViewNavigationEvent } from "react-native-webview/lib/WebViewTypes"
import { BaseStatusBar, DAppIcon, Layout, URLBar, useInAppBrowser } from "~Components"
import { AnalyticsEvent, COLORS, ColorThemeType } from "~Constants"
import { useAnalyticTracking, useGetDappMetadataFromUrl, useThemedStyles } from "~Hooks"
import { useDynamicAppLogo } from "~Hooks/useAppLogo"
import { useBrowserScreenshot } from "~Hooks/useBrowserScreenshot"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { RootStackParamListApps } from "~Navigation/Stacks/AppsStack"
import { RootStackParamListHome } from "~Navigation/Stacks/HomeStack"
import { deleteSession, selectSelectedNetwork, selectSession, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { ChangeAccountNetworkBottomSheet } from "./Components/ChangeAccountNetworkBottomSheet"
import { RootStackParamListBrowser } from "~Navigation/Stacks/DiscoverStack"

type Props = NativeStackScreenProps<
    RootStackParamListBrowser | RootStackParamListApps | RootStackParamListHome,
    Routes.BROWSER
>

export const InAppBrowser: React.FC<Props> = ({ route }) => {
    const {
        webviewRef,
        onMessage,
        onScroll,
        injectVechainScript,
        onNavigationStateChange,
        resetWebViewState,
        ChangeAccountNetworkBottomSheetRef,
        originWhitelist,
        isLoading,
        navigationState,
    } = useInAppBrowser()

    const track = useAnalyticTracking()
    const nav = useNavigation()
    const { locale } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const [isLoadingWebView, setIsLoadingWebView] = useState(true)
    const { ref: webviewContainerRef, performScreenshot } = useBrowserScreenshot()
    const dispatch = useAppDispatch()
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const activeSession = useAppSelector(state =>
        selectSession(state, navigationState?.url ?? "", selectedNetwork.genesis.id),
    )
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
        return (
            <Animated.View
                exiting={isIOS() ? FadeOut.duration(400).easing(Easing.out(Easing.ease)) : undefined}
                style={[styles.loadingWebView]}>
                <DAppIcon uri={iconUri} size={88} />
            </Animated.View>
        )
    }, [iconUri, styles.loadingWebView])

    const onNavigate = useCallback(async () => {
        await performScreenshot()
        if (!activeSession || !navigationState?.url || activeSession.kind !== "temporary") return
        dispatch(deleteSession(navigationState?.url))
    }, [activeSession, dispatch, navigationState?.url, performScreenshot])

    const onAndroidBackPress = useCallback((): boolean => {
        if (webviewRef.current) {
            webviewRef.current.goBack()
            return true // prevent default behavior (exit app)
        }
        return false
    }, [webviewRef])

    useEffect((): (() => void) | undefined => {
        if (Platform.OS === "android") {
            const nativeEventSubscription = BackHandler.addEventListener("hardwareBackPress", onAndroidBackPress)
            return (): void => {
                nativeEventSubscription.remove()
            }
        }
    }, [onAndroidBackPress])

    return (
        <Layout
            bg={COLORS.BALANCE_BACKGROUND}
            fixedHeader={
                <URLBar
                    navigationUrl={route.params.url}
                    isLoading={isLoadingWebView}
                    onNavigate={onNavigate}
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
                                allowsBackForwardNavigationGestures
                                style={styles.loginWebView}
                                scalesPageToFit={true}
                                injectedJavaScriptBeforeContentLoaded={injectVechainScript()}
                                allowsInlineMediaPlayback={true}
                                originWhitelist={originWhitelist}
                                collapsable={false}
                                pullToRefreshEnabled
                                startInLoadingState={true}
                                renderLoading={renderLoading}
                            />
                        </Animated.View>
                    )}

                    <ChangeAccountNetworkBottomSheet ref={ChangeAccountNetworkBottomSheetRef} />
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
