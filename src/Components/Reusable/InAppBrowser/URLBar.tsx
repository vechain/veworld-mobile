import React, { useCallback, useMemo } from "react"
import { BaseIcon, BaseText, BaseView, SelectedNetworkViewer, useInAppBrowser } from "~Components"
import { StyleSheet } from "react-native"
import { useBlockchainNetwork, useTheme } from "~Hooks"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"

export const URLBar = () => {
    const { showToolbars, navigationState } = useInAppBrowser()
    const nav = useNavigation()
    const { isMainnet } = useBlockchainNetwork()

    const urlText = useMemo(() => {
        if (!navigationState?.url) return ""

        try {
            return new URL(navigationState.url).hostname
        } catch {
            return ""
        }
    }, [navigationState?.url])

    const isSecure = useMemo(() => {
        if (!navigationState?.url) return false

        try {
            return new URL(navigationState.url).protocol === "https:"
        } catch {
            return false
        }
    }, [navigationState?.url])

    const navBackToDiscover = useCallback(() => {
        if (nav.canGoBack()) {
            nav.goBack()
        } else {
            nav.navigate(Routes.DISCOVER)
        }
    }, [nav])

    const theme = useTheme()

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{ translateY: showToolbars ? withTiming(0) : withTiming(-50) }],
        height: showToolbars ? withTiming(48) : withTiming(0),
        opacity: showToolbars ? withTiming(1) : withTiming(0),
    }))

    return navigationState?.url ? (
        <Animated.View style={[styles.animatedContainer, animatedStyles]}>
            <BaseView style={styles.inputContainer}>
                {/* Icon on the left */}
                <BaseIcon
                    haptics="Light"
                    size={20}
                    style={styles.iconLeft}
                    name={isSecure ? "icon-lock" : "icon-unlock"}
                    color={isSecure ? theme.colors.text : theme.colors.alertRedMedium}
                />

                {/* URL Text centered */}
                <BaseView flex={1} flexDirection="row" justifyContent="space-between">
                    <BaseText
                        w={isMainnet ? 100 : 65}
                        color={theme.colors.text}
                        fontSize={14}
                        fontWeight="500"
                        style={[styles.urlText]}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {urlText}
                    </BaseText>

                    {!isMainnet && <SelectedNetworkViewer />}
                </BaseView>

                <BaseIcon
                    testID="closeButton"
                    action={navBackToDiscover}
                    haptics="Light"
                    style={[styles.iconRight]}
                    name="icon-x"
                    color={isSecure ? theme.colors.text : theme.colors.alertRedMedium}
                />
            </BaseView>
        </Animated.View>
    ) : null
}

const styles = StyleSheet.create({
    animatedContainer: {
        opacity: 1,
        alignItems: "center",
    },
    inputContainer: {
        width: "100%",
        height: 48,
        paddingHorizontal: 16,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    urlText: {
        textAlign: "center", // centers the text
        marginHorizontal: 10, // adds space around the text
        marginVertical: 10,
    },
    iconLeft: {
        marginRight: 10,
    },
    iconRight: {
        marginLeft: 10,
    },
})
