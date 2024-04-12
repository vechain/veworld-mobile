import { Layout } from "~Components"
import { StyleSheet, View } from "react-native"
import React, { MutableRefObject, useEffect } from "react"
import WebView from "react-native-webview"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { BrowserBottomBar, URLBar } from "./Components"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListBrowser, Routes } from "~Navigation"
import DeviceInfo from "react-native-device-info"
import { ChangeAccountNetworkBottomSheet } from "./Components/ChangeAccountNetworkBottomSheet"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useNavigation } from "@react-navigation/native"
import { DdRum, RumActionType } from "@datadog/mobile-react-native"

type Props = NativeStackScreenProps<RootStackParamListBrowser, Routes.BROWSER>

export const InAppBrowser: React.FC<Props> = ({ route }) => {
    const {
        webviewRef,
        onMessage,
        injectVechainScript,
        onNavigationStateChange,
        resetWebViewState,
        targetAccount,
        targetNetwork,
        handleCloseChangeAccountNetworkBottomSheet,
        handleConfirmChangeAccountNetworkBottomSheet,
        ChangeAccountNetworkBottomSheetRef,
    } = useInAppBrowser()

    const track = useAnalyticTracking()
    const nav = useNavigation()

    useEffect(() => {
        if (route?.params?.ul) {
            track(AnalyticsEvent.DAPP_UNIVERSAL_LINK_INITIATED, { isUniversalLink: route.params.url })
            DdRum.startView("DAPP_DISCOVERY", "DAPP_DISCOVERY", {}, Date.now())
            DdRum.addAction(RumActionType.TAP, "DAPP_UNIVERSAL_LINK_INITIATED") // Log specific user action
            DdRum.stopView("DAPP_DISCOVERY") // Stop tracking the view when component unmounts or changes
        }
    }, [nav, route.params?.ul, route.params.url, track])

    const [userAgent, setUserAgent] = React.useState<string | undefined>(undefined)

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
                    {userAgent && (
                        <WebView
                            ref={webviewRef as MutableRefObject<WebView>}
                            source={{ uri: route.params.url }}
                            userAgent={userAgent}
                            onNavigationStateChange={onNavigationStateChange}
                            javaScriptEnabled={true}
                            onMessage={onMessage}
                            style={styles.loginWebView}
                            scalesPageToFit={true}
                            injectedJavaScriptBeforeContentLoaded={injectVechainScript}
                            allowsInlineMediaPlayback={true}
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
