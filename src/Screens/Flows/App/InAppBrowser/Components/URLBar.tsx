import React, { useCallback, useMemo } from "react"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"

export const URLBar = () => {
    const { navigationState } = useInAppBrowser()
    const nav = useNavigation()

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

    return (
        <BaseView style={styles.inputContainer}>
            {navigationState?.url && (
                <>
                    {/* Icon on the left */}
                    <BaseIcon
                        haptics="Light"
                        size={20}
                        style={[styles.icon]}
                        name={isSecure ? "lock-check-outline" : "lock-open-outline"}
                        color={isSecure ? theme.colors.text : theme.colors.alertRedMedium}
                    />

                    {/* URL Text centered */}
                    <BaseText
                        color={theme.colors.text}
                        fontSize={14}
                        fontWeight="500"
                        style={[styles.urlText]}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {urlText}
                    </BaseText>

                    <BaseTouchableBox style={styles.pressableIcon} onPress={navBackToDiscover}>
                        <BaseIcon
                            haptics="Light"
                            style={[styles.icon]}
                            name="close"
                            color={isSecure ? theme.colors.text : theme.colors.alertRedMedium}
                        />
                    </BaseTouchableBox>
                </>
            )}
        </BaseView>
    )
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
        flex: 1, // takes the available space
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
