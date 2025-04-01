import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { NativeSyntheticEvent, StyleSheet, TextInputSubmitEditingEventData } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseIcon, BaseText, BaseTextInput, BaseView, useInAppBrowser } from "~Components"
import { useTheme } from "~Hooks"
import { Routes } from "~Navigation"

export const URLBar = () => {
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
        // transform: [{ translateY: showToolbars ? withTiming(0) : withTiming(-56) }],
        height: showToolbars ? withTiming(56) : withTiming(24),
        // opacity: showToolbars ? withTiming(1) : withTiming(0),
    }))

    const onSubmit = useCallback(
        (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
            //TODO: Add error state
            navigateToUrl(e.nativeEvent.text)
        },
        [navigateToUrl],
    )

    const renderWithToolbar = useMemo(() => {
        return (
            <BaseView style={styles.inputContainer}>
                {/* Icon on the left */}
                <BaseIcon
                    name="icon-arrow-left"
                    color={theme.colors.text}
                    action={navBackToDiscover}
                    haptics="Light"
                    size={24}
                    p={8}
                />

                {/* URL Text centered */}
                <BaseView flex={1}>
                    {isDapp ? (
                        <BaseView />
                    ) : (
                        <BaseTextInput
                            defaultValue={navigationState?.url}
                            onSubmitEditing={onSubmit}
                            style={styles.textInput}
                            inputContainerStyle={styles.textInputContainer}
                        />
                    )}
                </BaseView>
            </BaseView>
        )
    }, [isDapp, navBackToDiscover, navigationState, onSubmit, theme.colors.text])

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
    },
})
