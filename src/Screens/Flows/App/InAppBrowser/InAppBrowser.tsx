import { Layout } from "~Components"
import { StyleSheet, View } from "react-native"
import React, { MutableRefObject, useEffect } from "react"
import WebView from "react-native-webview"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { BrowserBottomBar, URLInput } from "./Components"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListSwitch, Routes } from "~Navigation"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.BROWSER>

export const InAppBrowser: React.FC<Props> = ({ route }) => {
    const { webviewRef, onMessage, injectVechainScript, onNavigationStateChange, navigationState, resetWebViewState } =
        useInAppBrowser()

    useEffect(() => {
        // set the webview ref to undefined when the component unmounts
        return () => {
            resetWebViewState()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Layout
            fixedHeader={<URLInput />}
            noBackButton
            noMargin
            footer={<BrowserBottomBar />}
            fixedBody={
                <>
                    <View style={styles.container}>
                        <WebView
                            ref={webviewRef as MutableRefObject<WebView>}
                            source={{
                                uri: navigationState?.url ?? route.params.initialUrl,
                            }}
                            onNavigationStateChange={onNavigationStateChange}
                            javaScriptEnabled={true}
                            onMessage={onMessage}
                            style={styles.loginWebView}
                            scalesPageToFit={true}
                            injectedJavaScriptBeforeContentLoaded={injectVechainScript}
                        />
                    </View>
                </>
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
