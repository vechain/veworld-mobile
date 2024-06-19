import React, { useCallback, useMemo } from "react"
import { BaseIcon, BaseText, BaseView, SelectedNetworkViewer, useInAppBrowser } from "~Components"
import { StyleSheet } from "react-native"
import { useBlockchainNetwork, useTheme } from "~Hooks"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"

export const URLBar = () => {
    const { navigationState } = useInAppBrowser()
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

    return navigationState?.url ? (
        <BaseView style={styles.inputContainer}>
            {/* Icon on the left */}
            <BaseIcon
                haptics="Light"
                size={20}
                style={[styles.icon]}
                name={isSecure ? "lock-check-outline" : "lock-open-outline"}
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
                action={navBackToDiscover}
                haptics="Light"
                style={[styles.icon]}
                name="close"
                color={isSecure ? theme.colors.text : theme.colors.alertRedMedium}
            />
        </BaseView>
    ) : null
}

const styles = StyleSheet.create({
    inputContainer: {
        width: "100%",
        height: 40,
        paddingHorizontal: 20,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    urlText: {
        textAlign: "center", // centers the text
        marginHorizontal: 10, // adds space around the text
        marginVertical: 10,
    },
    pressableIcon: {
        margin: 10,
    },
    icon: {
        marginHorizontal: 10,
    },
})
