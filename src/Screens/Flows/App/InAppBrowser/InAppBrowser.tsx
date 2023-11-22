import { Layout } from "~Components"
import { StyleSheet, View } from "react-native"
import React, { MutableRefObject, useEffect } from "react"
import WebView from "react-native-webview"
import { DISCOVER_HOME_URL, useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { BrowserFavouritesBottomSheet, URLInput } from "./Components"
import { BrowserBottomBar } from "~Screens/Flows/App/InAppBrowser/Components/BrowserBottomBar"
import { useBottomSheetModal } from "~Hooks"
import { BrowserTabsBottomSheet } from "~Screens/Flows/App/InAppBrowser/Components/BrowserTabsBottomSheet"

export const InAppBrowser = () => {
    const { webviewRef, onMessage, injectVechainScript, onNavigationStateChange, navigationState } = useInAppBrowser()

    const {
        ref: tabManagerSheetRef,
        onOpen: openTabManagerSheet,
        onClose: closeTabManagerSheet,
    } = useBottomSheetModal()

    const { ref: onFavoritesSheetRef, onOpen: openFavoritesSheet, onClose: closeFavoritesSheet } = useBottomSheetModal()

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
            footer={<BrowserBottomBar onTabClick={openTabManagerSheet} onFavouriteClick={openFavoritesSheet} />}
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
                            injectedJavaScriptBeforeContentLoaded={injectVechainScript}
                        />
                    </View>

                    <BrowserTabsBottomSheet ref={tabManagerSheetRef} onClose={closeTabManagerSheet} />

                    <BrowserFavouritesBottomSheet ref={onFavoritesSheetRef} onClose={closeFavoritesSheet} />
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
