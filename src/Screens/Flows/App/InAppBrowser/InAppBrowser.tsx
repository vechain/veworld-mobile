import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import DeviceInfo from "react-native-device-info"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { captureRef, releaseCapture } from "react-native-view-shot"
import WebView from "react-native-webview"
import { BaseIcon, BaseText, BaseView, BrowserBottomBar, Layout, URLBar, useInAppBrowser } from "~Components"
import { AnalyticsEvent, ColorThemeType } from "~Constants"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListBrowser, Routes } from "~Navigation"
import { selectCurrentTab, updateTab, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { ChangeAccountNetworkBottomSheet } from "./Components/ChangeAccountNetworkBottomSheet"

type Props = NativeStackScreenProps<RootStackParamListBrowser, Routes.BROWSER>

export const InAppBrowser: React.FC<Props> = ({ route }) => {
    const webviewContainerRef = useRef<View>(null)

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

    const selectedTab = useAppSelector(selectCurrentTab)
    const dispatch = useAppDispatch()

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

    const onNavigate = useCallback(async () => {
        if (webviewContainerRef.current && selectedTab) {
            try {
                await captureRef(webviewContainerRef, {
                    format: "jpg",
                    quality: 0.9,
                    fileName: `${selectedTab.id}-preview-${Date.now()}`,
                    result: "data-uri",
                }).then(uri => {
                    dispatch(updateTab({ ...selectedTab, preview: uri }))
                    releaseCapture(uri)
                })
            } catch {}
        }
    }, [webviewContainerRef, selectedTab, dispatch])

    return (
        <Layout
            fixedHeader={<URLBar onBrowserNavigation={setError} onNavigate={onNavigate} />}
            noBackButton
            noMargin
            hasSafeArea={false}
            hasTopSafeAreaOnly
            footer={<BrowserBottomBar />}
            fixedBody={
                <View style={styles.container}>
                    {userAgent && !isLoading && (
                        <>
                            <Animated.View
                                ref={webviewContainerRef}
                                style={animatedStyles}
                                sharedTransitionTag="BROWSER_TAB"
                                collapsable={false}>
                                <WebView
                                    ref={webviewRef as MutableRefObject<WebView>}
                                    source={{ uri: route.params.url, headers: { "Accept-Language": locale } }}
                                    userAgent={userAgent}
                                    onNavigationStateChange={onNavigationStateChange}
                                    javaScriptEnabled={true}
                                    onMessage={onMessage}
                                    onScroll={onScroll}
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
