import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import FastImage from "react-native-fast-image"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { BaseIcon } from "~Components/Base/BaseIcon"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useGetDappMetadataFromUrl } from "~Hooks"
import { useDynamicAppLogo } from "~Hooks/useAppLogo"
import { RootStackParamListBrowser, RootStackParamListHome, RootStackParamListSettings, Routes } from "~Navigation"
import { RootStackParamListApps } from "~Navigation/Stacks/AppsStack"
import { DAppUtils } from "~Utils/DAppUtils"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { Spinner } from "../Spinner"
import { BrowserBottomSheet } from "./BrowserBottomSheet"

type Props = {
    navigationUrl: string
    onNavigate?: () => void | Promise<void>
    returnScreen?: Routes.DISCOVER | Routes.SETTINGS | Routes.HOME | Routes.ACTIVITY_STAKING | Routes.APPS | Routes.SWAP
    isLoading?: boolean
}

const AnimatedBaseIcon = Animated.createAnimatedComponent(BaseIcon)
const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))
const AnimatedBaseText = Animated.createAnimatedComponent(wrapFunctionComponent(BaseText))
const AnimatedTouchable = Animated.createAnimatedComponent(wrapFunctionComponent(BaseTouchable))
const AnimatedFavicon = Animated.createAnimatedComponent(FastImage)

export const URLBar = ({ onNavigate, returnScreen, isLoading, navigationUrl }: Props) => {
    const { showToolbars } = useInAppBrowser()
    const { betterWorldFeature } = useFeatureFlags()
    const dappMetadata = useGetDappMetadataFromUrl(navigationUrl)
    const fetchDynamicLogo = useDynamicAppLogo({})

    const nav =
        useNavigation<
            NativeStackNavigationProp<
                RootStackParamListBrowser & RootStackParamListSettings & RootStackParamListHome & RootStackParamListApps
            >
        >()

    const _returnScreen = useMemo(() => {
        if (returnScreen) return returnScreen
        if (betterWorldFeature.appsScreen.enabled) return Routes.APPS
        return Routes.DISCOVER
    }, [betterWorldFeature.appsScreen.enabled, returnScreen])

    const { onOpen: openBottomSheet, ref: bottomSheetRef, onClose: closeBottomSheet } = useBottomSheetModal()

    const navToDiscover = useCallback(async () => {
        await onNavigate?.()
        nav.navigate(_returnScreen)
    }, [nav, onNavigate, _returnScreen])

    const navToSearch = useCallback(async () => {
        await onNavigate?.()
        if (betterWorldFeature.appsScreen.enabled) {
            nav.replace(Routes.APPS_SEARCH)
        } else {
            nav.replace(Routes.DISCOVER_SEARCH)
        }
    }, [betterWorldFeature.appsScreen.enabled, nav, onNavigate])

    const animatedFaviconStyles = useAnimatedStyle(
        () => ({
            transform: [{ scale: withTiming(showToolbars ? 1 : 0.6, { duration: 300 }) }],
        }),
        [showToolbars],
    )

    const parsedDappMetadata = useMemo(() => {
        if (dappMetadata)
            return {
                icon: fetchDynamicLogo({ app: dappMetadata }),
                name: dappMetadata.name,
                url: navigationUrl,
                isDapp: true,
            }

        return {
            name: new URL(navigationUrl).hostname,
            url: navigationUrl,
            icon: DAppUtils.generateFaviconUrl(navigationUrl, { size: 64 }),
            isDapp: false,
        }
    }, [dappMetadata, fetchDynamicLogo, navigationUrl])

    const websiteFavicon = useMemo(() => {
        return parsedDappMetadata.icon ? (
            <AnimatedFavicon
                testID="URL-bar-dapp-favicon"
                source={{ uri: parsedDappMetadata.icon, priority: FastImage.priority.high }}
                style={isIOS() ? [animatedFaviconStyles, styles.favicon] : styles.favicon}
            />
        ) : (
            <AnimatedBaseIcon
                testID="URL-bar-website-favicon"
                name="icon-globe"
                color={COLORS.GREY_400}
                bg={COLORS.GREY_600}
                size={12}
                p={6}
                style={isIOS() ? [animatedFaviconStyles, styles.favicon] : styles.favicon}
            />
        )
    }, [parsedDappMetadata, animatedFaviconStyles])

    const websiteName = useMemo(() => {
        const url = new URL(navigationUrl)
        return dappMetadata ? dappMetadata.name : url.hostname.replace("www.", "") || "about:blank"
    }, [dappMetadata, navigationUrl])

    return (
        <>
            <Animated.View style={styles.animatedContainer}>
                <AnimatedBaseView style={styles.inputContainer}>
                    {/* Icon on the left */}
                    <AnimatedBaseIcon
                        testID="URL-bar-back-button"
                        name="icon-x"
                        color={COLORS.GREY_50}
                        bg={COLORS.PURPLE}
                        action={navToDiscover}
                        haptics="Light"
                        size={16}
                        p={8}
                        style={styles.iconButton}
                    />

                    {/* URL Text centered */}
                    <AnimatedTouchable
                        testID="URL-bar-website-name"
                        style={styles.urlContainer}
                        onPress={navToSearch}
                        disabled={isLoading}>
                        <AnimatedBaseView
                            flex={1}
                            alignItems="center"
                            flexDirection="row"
                            justifyContent="center"
                            gap={8}>
                            {isLoading ? (
                                <Spinner color={COLORS.WHITE} size={20} style={styles.spinner} />
                            ) : (
                                websiteFavicon
                            )}
                            <AnimatedBaseText
                                allowFontScaling={false}
                                typographyFont="bodySemiBold"
                                color={COLORS.GREY_50}
                                style={[styles.appName]}>
                                {websiteName}
                            </AnimatedBaseText>
                        </AnimatedBaseView>
                    </AnimatedTouchable>

                    <AnimatedBaseIcon
                        name="icon-more-vertical"
                        color={COLORS.GREY_50}
                        bg={COLORS.PURPLE}
                        action={openBottomSheet}
                        haptics="Light"
                        size={16}
                        p={8}
                        style={styles.iconButton}
                    />
                </AnimatedBaseView>
            </Animated.View>

            <BrowserBottomSheet ref={bottomSheetRef} onNavigate={onNavigate} onClose={closeBottomSheet} />
        </>
    )
}

const styles = StyleSheet.create({
    animatedContainer: {
        opacity: 1,
        alignItems: "center",
        flexDirection: "row",
        // backgroundColor: COLORS.DARK_PURPLE,
        paddingVertical: 8,
    },
    inputContainer: {
        width: "100%",
        height: 40,
        paddingHorizontal: 16,
        alignItems: "center",
        flexDirection: "row",
        gap: 16,
    },
    noToolbarContainer: {
        height: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        paddingHorizontal: 16,
        marginVertical: 8,
    },
    dappContainer: {
        gap: 8,
    },
    appName: {
        textAlign: "center", // centers the text
        transformOrigin: "center",
        fontSize: 14,
        fontWeight: "700",
    },
    textInput: {
        fontSize: 12,
        paddingVertical: 8,
    },
    textInputContainer: {
        height: 32,
        paddingVertical: 0,
        width: "100%",
    },
    textInputContainerRoot: {
        width: "100%",
    },
    urlContainer: {
        flex: 1,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
    },
    favicon: {
        width: 24,
        height: 24,
        borderRadius: 4,
        transformOrigin: "center",
    },
    iconButton: {
        transformOrigin: "center",
    },
    spinner: {
        padding: 2,
    },
})
