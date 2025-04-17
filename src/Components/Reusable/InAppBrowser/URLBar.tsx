import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { NativeSyntheticEvent, StyleSheet, TextInputSubmitEditingEventData } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseIcon, BaseText, BaseTextInput, BaseView, useInAppBrowser } from "~Components"
import { useTheme } from "~Hooks"
import { Routes } from "~Navigation"
import { URIUtils } from "~Utils"

type Props = {
    onNavigation?: (error: boolean) => void
}

export const URLBar = ({ onNavigation }: Props) => {
    const { showToolbars, navigationState, isDapp, navigateToUrl } = useInAppBrowser()
    const nav = useNavigation()

    const navBackToDiscover = useCallback(() => {
        if (nav.canGoBack()) {
            nav.goBack()
        } else {
            nav.navigate(Routes.DISCOVER)
        }
    }, [nav])

    const theme = useTheme()

    const animatedStyles = useAnimatedStyle(() => ({
        height: showToolbars ? withTiming(56) : withTiming(24),
    }))

    const onSubmit = useCallback(
        async (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
            const value = e.nativeEvent.text.toLowerCase()
            const isValid = await URIUtils.isValidBrowserUrl(value)
            if (isValid) {
                const url = value.startsWith("https://") ? value : `https://${value}`
                onNavigation?.(false)
                navigateToUrl(url)
                return
            }
            onNavigation?.(true)
        },
        [navigateToUrl, onNavigation],
    )

    const renderWithToolbar = useMemo(() => {
        return (
            <BaseView style={styles.inputContainer}>
                {/* Icon on the left */}
                <BaseIcon
                    testID="URL-bar-back-button"
                    name="icon-arrow-left"
                    color={theme.colors.text}
                    action={navBackToDiscover}
                    haptics="Light"
                    size={24}
                    p={8}
                />

                {/* URL Text centered */}
                <BaseView flex={1} alignItems="center" flexDirection="row">
                    {isDapp ? (
                        <BaseView flexDirection="row" alignItems="center" style={styles.dappContainer}>
                            <BaseIcon name="icon-lock" color={theme.colors.textLight} size={12} />

                            <BaseText
                                testID="URL-bar-dapp-name"
                                typographyFont="captionRegular"
                                color={theme.colors.subtitle}>
                                {navigationState?.url}
                            </BaseText>
                        </BaseView>
                    ) : (
                        <BaseTextInput
                            testID="URL-bar-input"
                            defaultValue={navigationState?.url}
                            onSubmitEditing={onSubmit}
                            style={styles.textInput}
                            inputContainerStyle={styles.textInputContainer}
                            containerStyle={styles.textInputContainerRoot}
                        />
                    )}
                </BaseView>
            </BaseView>
        )
    }, [
        isDapp,
        navBackToDiscover,
        navigationState?.url,
        onSubmit,
        theme.colors.subtitle,
        theme.colors.text,
        theme.colors.textLight,
    ])

    const renderWithoutToolbar = useMemo(() => {
        return (
            <BaseView style={styles.noToolbarContainer}>
                <BaseText typographyFont="smallCaptionMedium" color={theme.colors.subtitle}>
                    {navigationState?.url}
                </BaseText>
            </BaseView>
        )
    }, [navigationState?.url, theme.colors.subtitle])

    return navigationState?.url ? (
        <Animated.View style={[styles.animatedContainer, animatedStyles]}>
            {showToolbars ? renderWithToolbar : renderWithoutToolbar}
        </Animated.View>
    ) : null
}

const styles = StyleSheet.create({
    animatedContainer: {
        opacity: 1,
        alignItems: "center",
        flexDirection: "row",
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
    },
    dappContainer: {
        gap: 8,
    },
    urlText: {
        textAlign: "center", // centers the text
        marginHorizontal: 10, // adds space around the text
        marginVertical: 10,
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
})
