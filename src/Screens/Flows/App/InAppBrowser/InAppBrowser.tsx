import { Layout } from "~Components"
import { Header } from "~Screens"
import { StyleSheet, View } from "react-native"
import React from "react"
import WebView from "react-native-webview"

export const InAppBrowser = () => {
    return (
        <Layout
            fixedHeader={<Header />}
            noBackButton
            noMargin
            fixedBody={
                <>
                    <View style={styles.container}>
                        <WebView
                            source={{
                                uri: "https://veworld-dapp-vecha.in",
                            }}
                            style={styles.loginWebView}
                            scalesPageToFit={true}
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
        marginTop: 30,
        marginBottom: 20,
    },
})
