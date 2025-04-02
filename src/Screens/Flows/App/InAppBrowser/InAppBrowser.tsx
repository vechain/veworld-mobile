import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { MutableRefObject, useEffect } from "react"
import { StyleSheet, View } from "react-native"
import DeviceInfo from "react-native-device-info"
import WebView from "react-native-webview"
import { BrowserBottomBar, Layout, URLBar, useInAppBrowser } from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListBrowser, Routes } from "~Navigation"
import { ChangeAccountNetworkBottomSheet } from "./Components/ChangeAccountNetworkBottomSheet"

type Props = NativeStackScreenProps<RootStackParamListBrowser, Routes.BROWSER>

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

    return (
        <Layout
            fixedHeader={<URLBar />}
            noBackButton
            noMargin
            hasSafeArea={false}
            hasTopSafeAreaOnly
            footer={<BrowserBottomBar />}
            fixedBody={
                <View style={styles.container}>
                    {userAgent && !isLoading && (
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
                        />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "stretch",
    },
    loginWebView: {
        flex: 1,
    },
})
