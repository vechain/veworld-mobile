import { Layout } from "~Components"
import { StyleSheet, View } from "react-native"
import React, { MutableRefObject, useEffect } from "react"
import WebView from "react-native-webview"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { BrowserBottomBar, URLBar } from "./Components"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import DeviceInfo from "react-native-device-info"
import { ChangeAccountNetworkBottomSheet } from "./Components/ChangeAccountNetworkBottomSheet"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.BROWSER>

export const InAppBrowser: React.FC<Props> = ({ route }) => {
    const {
        webviewRef,
        onMessage,
        injectVechainScript,
        onNavigationStateChange,
        navigationState,
        resetWebViewState,
        targetAccount,
        targetNetwork,
        handleCloseChangeAccountNetworkBottomSheet,
        handleConfirmChangeAccountNetworkBottomSheet,
        ChangeAccountNetworkBottomSheetRef,
    } = useInAppBrowser()

    const track = useAnalyticTracking()

    useEffect(() => {
        if (route?.params?.isUniversalLink) {
            track(AnalyticsEvent.DAPP_UNIVERSAL_LINK_INITIATED, { isUniversalLink: route.params.isUniversalLink })
        }
    }, [route.params.isUniversalLink, track])

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
            footer={<BrowserBottomBar />}
            fixedBody={
                <View style={styles.container}>
                    {userAgent && (
                        <WebView
                            ref={webviewRef as MutableRefObject<WebView>}
                            source={{
                                uri: navigationState?.url ?? route.params.initialUrl,
                            }}
                            userAgent={userAgent}
                            onNavigationStateChange={onNavigationStateChange}
                            javaScriptEnabled={true}
                            onMessage={onMessage}
                            style={styles.loginWebView}
                            scalesPageToFit={true}
                            injectedJavaScriptBeforeContentLoaded={injectVechainScript}
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
