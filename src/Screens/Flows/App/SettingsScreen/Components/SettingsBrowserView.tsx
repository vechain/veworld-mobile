import { Layout, useInAppBrowser, BrowserBottomBar, URLBar } from "~Components"
import { StyleSheet, View } from "react-native"
import React, { MutableRefObject, useEffect } from "react"
import WebView from "react-native-webview"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListSettings, Routes } from "~Navigation"
import DeviceInfo from "react-native-device-info"

type Props = NativeStackScreenProps<
    RootStackParamListSettings,
    Routes.SETTINGS_GET_SUPPORT | Routes.SETTINGS_GIVE_FEEDBACK
>

export const SettingsBrowserView: React.FC<Props> = ({ route }) => {
    const { webviewRef, resetWebViewState, onScroll, onNavigationStateChange, originWhitelist } = useInAppBrowser()

    const [userAgent, setUserAgent] = React.useState<string | undefined>(undefined)

    useEffect(() => {
        DeviceInfo.getUserAgent().then(setUserAgent)
    }, [route.params.url])

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
                            javaScriptEnabled={true}
                            style={styles.loginWebView}
                            scalesPageToFit={true}
                            allowsInlineMediaPlayback={true}
                            onNavigationStateChange={onNavigationStateChange}
                            onScroll={onScroll}
                            originWhitelist={originWhitelist}
                        />
                    )}
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
