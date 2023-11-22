import { Layout } from "~Components"
import { StyleSheet, View } from "react-native"
import React, { MutableRefObject, useEffect } from "react"
import WebView from "react-native-webview"
import {
    DISCOVER_HOME_URL,
    useInAppBrowser,
} from "~Components/Providers/InAppBrowserProvider"
import { URLInput } from "./Components"
import { BrowserBottomBar } from "~Screens/Flows/App/InAppBrowser/Components/BrowserBottomBar"

export const InAppBrowser = () => {
    const {
        webviewRef,
        onMessage,
        injectVechainScript,
        onNavigationStateChange,
        navigationState,
    } = useInAppBrowser()

    useEffect(() => {
        // set the webview ref to undefined when the component unmounts
        return () => {
            webviewRef.current = undefined
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
                                uri: navigationState?.url ?? DISCOVER_HOME_URL,
                            }}
                            onNavigationStateChange={onNavigationStateChange}
                            javaScriptEnabled={true}
                            onMessage={onMessage}
                            style={styles.loginWebView}
                            scalesPageToFit={true}
                            injectedJavaScriptBeforeContentLoaded={
                                injectVechainScript
                            }
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
