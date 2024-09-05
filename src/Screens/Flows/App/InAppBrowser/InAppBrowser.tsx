import { Layout, useInAppBrowser } from "~Components"
import { StyleSheet, View } from "react-native"
import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react"
import WebView from "react-native-webview"
import { BrowserBottomBar, URLBar } from "./Components"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListBrowser, Routes } from "~Navigation"
import DeviceInfo from "react-native-device-info"
import { ChangeAccountNetworkBottomSheet } from "./Components/ChangeAccountNetworkBottomSheet"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useNavigation } from "@react-navigation/native"
import { RumManager } from "~Logging/RumManager"
import { Double } from "react-native/Libraries/Types/CodegenTypes"
// import { SlideOutUp, SlideInDown } from "react-native-reanimated"

type Props = NativeStackScreenProps<RootStackParamListBrowser, Routes.BROWSER>

type ScrollOffset = { x: Double; y: Double }
enum ScrollDirection {
    NONE = "NONE",
    UP = "UP",
    DOWN = "DOWN",
}

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

    let prevY = useRef<Double>(0)
    const [showToolbars, setShowToolbars] = useState(true)

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

    const detectScrollDirection = useCallback(
        (offset: ScrollOffset): ScrollDirection => {
            const { y } = offset
            let direction = ScrollDirection.NONE

            if (prevY.current < y) direction = ScrollDirection.DOWN
            if (prevY.current > y) direction = ScrollDirection.UP

            prevY.current = y

            return direction
        },
        [prevY],
    )

    const handleScroll = useCallback(
        (offset: ScrollOffset) => {
            const direction = detectScrollDirection(offset)
            if (direction === ScrollDirection.DOWN && showToolbars) setShowToolbars(false)
            if (direction === ScrollDirection.UP && !showToolbars) setShowToolbars(true)
            if (offset.y === 0 || offset.y < 0) setShowToolbars(true)
        },
        [detectScrollDirection, showToolbars],
    )

    return (
        <Layout
            fixedHeader={<URLBar isVisible={showToolbars} />}
            noBackButton
            noMargin
            hasSafeArea={false}
            hasTopSafeAreaOnly
            footer={<BrowserBottomBar isVisible={showToolbars} />}
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
                            onScroll={e => {
                                handleScroll(e.nativeEvent.contentOffset)
                            }}
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
