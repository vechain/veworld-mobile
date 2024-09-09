import { Layout, useInAppBrowser, BrowserBottomBar, URLBar } from "~Components"
import { StyleSheet, View } from "react-native"
import React, { MutableRefObject, useEffect, useMemo } from "react"
import WebView from "react-native-webview"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListBrowser, Routes } from "~Navigation"
import DeviceInfo from "react-native-device-info"
import { ChangeAccountNetworkBottomSheet } from "./Components/ChangeAccountNetworkBottomSheet"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useNavigation } from "@react-navigation/native"
import { RumManager } from "~Logging/RumManager"

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
    } = useInAppBrowser()

    const track = useAnalyticTracking()
    const nav = useNavigation()

    const ddLogger = useMemo(() => new RumManager(), [])

    useEffect(() => {
        if (route?.params?.ul) {
            track(AnalyticsEvent.DAPP_UNIVERSAL_LINK_INITIATED, { isUniversalLink: route.params.url })
            ddLogger.logAction("DAPP_DISCOVERY", "DAPP_UNIVERSAL_LINK_INITIATED")
        }
    }, [nav, route.params?.ul, route.params.url, track, ddLogger])

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
                            onScroll={onScroll}
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
