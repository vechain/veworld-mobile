import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { MutableRefObject, useCallback, useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import DeviceInfo from "react-native-device-info"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import WebView from "react-native-webview"
import { BaseIcon, BaseText, BaseView, Layout, URLBar, useInAppBrowser } from "~Components"
import { AnalyticsEvent, COLORS, ColorThemeType } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useBrowserScreenshot } from "~Hooks/useBrowserScreenshot"
import { useI18nContext } from "~i18n"
import { RootStackParamListBrowser, Routes } from "~Navigation"
import { ChangeAccountNetworkBottomSheet } from "./Components/ChangeAccountNetworkBottomSheet"
import { RootStackParamListApps } from "~Navigation/Stacks/AppsStack"
import { InAppBrowserOptionsBottomSheet } from "./Components/InAppBrowserOptionsBottomSheet"

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
    const { locale, LL } = useI18nContext()
    const [error, setError] = useState(false)
    const { styles, theme } = useThemedStyles(baseStyles)
    const [isLoadingWebView, setIsLoadingWebView] = useState(false)
    const { ref: webviewContainerRef, performScreenshot } = useBrowserScreenshot()
    const {
        ref: InAppBrowserOptionsBottomSheetRef,
        onOpen: openInAppBrowserOptionsBottomSheet,
        onClose: closeInAppBrowserOptionsBottomSheet,
    } = useBottomSheetModal()

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

    const animatedStyles = useAnimatedStyle(() => {
        return {
            flex: error ? withTiming(0) : withTiming(1),
        }
    })

    const onLoadStart = useCallback(() => {
        setIsLoadingWebView(true)
    }, [])

    const onLoadEnd = useCallback(() => {
        setIsLoadingWebView(false)
    }, [])

    return (
        <Layout
            bg={COLORS.GREY_700}
            fixedHeader={
                <URLBar
                    isLoading={isLoadingWebView}
                    onBrowserNavigation={setError}
                    onNavigate={performScreenshot}
                    returnScreen={route.params.returnScreen}
                    onOpenOptions={openInAppBrowserOptionsBottomSheet}
                />
            }
            noBackButton
            noMargin
            hasSafeArea={false}
            hasTopSafeAreaOnly
            fixedBody={
                <View style={styles.container}>
                    {userAgent && !isLoading && (
                        <>
                            <Animated.View ref={webviewContainerRef} style={animatedStyles} collapsable={false}>
                                <WebView
                                    ref={webviewRef as MutableRefObject<WebView>}
                                    source={{ uri: route.params.url, headers: { "Accept-Language": locale } }}
                                    userAgent={userAgent}
                                    onNavigationStateChange={onNavigationStateChange}
                                    javaScriptEnabled={true}
                                    onMessage={onMessage}
                                    onScroll={onScroll}
                                    onLoadStart={onLoadStart}
                                    onLoadEnd={onLoadEnd}
                                    style={styles.loginWebView}
                                    scalesPageToFit={true}
                                    injectedJavaScriptBeforeContentLoaded={injectVechainScript()}
                                    allowsInlineMediaPlayback={true}
                                    originWhitelist={originWhitelist}
                                    collapsable={false}
                                />
                            </Animated.View>
                            {error && (
                                <Animated.ScrollView contentContainerStyle={styles.loginWebView}>
                                    <BaseView
                                        alignItems="center"
                                        justifyContent="center"
                                        flexDirection="row"
                                        flexGrow={1}>
                                        <BaseView style={styles.errorContainer}>
                                            <BaseIcon
                                                name="icon-disconnect"
                                                style={styles.errorIcon}
                                                size={32}
                                                color={theme.colors.emptyStateIcon.foreground}
                                            />
                                            <BaseText>{LL.BROWSER_HISTORY_ADDRESS_ERROR()}</BaseText>
                                        </BaseView>
                                    </BaseView>
                                </Animated.ScrollView>
                            )}
                        </>
                    )}
                    <ChangeAccountNetworkBottomSheet
                        targetAccount={targetAccount}
                        targetNetwork={targetNetwork}
                        ref={ChangeAccountNetworkBottomSheetRef}
                        onClose={handleCloseChangeAccountNetworkBottomSheet}
                        onConfirm={handleConfirmChangeAccountNetworkBottomSheet}
                    />
                    <InAppBrowserOptionsBottomSheet
                        ref={InAppBrowserOptionsBottomSheetRef}
                        onClose={closeInAppBrowserOptionsBottomSheet}
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
        },
        loginWebView: {
            flex: 1,
            borderTopStartRadius: 24,
            borderTopEndRadius: 24,
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
