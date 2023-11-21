import { Layout } from "~Components"
import { StyleSheet, View } from "react-native"
import React, { MutableRefObject, useEffect } from "react"
import WebView from "react-native-webview"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"

export const InAppBrowser = () => {
    const { webviewRef, onMessage, injectVechainScript } = useInAppBrowser()

    useEffect(() => {
        // set the webview ref to undefined when the component unmounts
        return () => {
            webviewRef.current = undefined
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Layout
            fixedHeader={null}
            noBackButton
            noMargin
            fixedBody={
                <>
                    <View style={styles.container}>
                        <WebView
                            ref={webviewRef as MutableRefObject<WebView>}
                            source={{
                                uri: "https://veworld-dapp-vecha.in",
                            }}
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
