import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { NativeSyntheticEvent, StyleSheet, TextInputSubmitEditingEventData } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { TabsIconSVG } from "~Assets"
import { BaseIcon, BaseText, BaseTextInput, BaseTouchable, BaseView, useInAppBrowser } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { RootStackParamListBrowser, RootStackParamListSettings, Routes } from "~Navigation"
import { selectCurrentTabId, selectTabs, updateTab, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { URIUtils } from "~Utils"

type Props = {
    onBrowserNavigation?: (error: boolean) => void
    onNavigate?: () => void | Promise<void>
    returnScreen?: Routes.DISCOVER | Routes.SETTINGS
}

export const URLBar = ({ onBrowserNavigation, onNavigate, returnScreen = Routes.DISCOVER }: Props) => {
    const { showToolbars, navigationState, isDapp, navigateToUrl } = useInAppBrowser()
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListBrowser & RootStackParamListSettings>>()

    const tabs = useAppSelector(selectTabs)
    const selectedTabId = useAppSelector(selectCurrentTabId)
    const dispatch = useAppDispatch()

    const navToDiscover = useCallback(async () => {
        await onNavigate?.()
        nav.navigate(returnScreen)
    }, [nav, onNavigate, returnScreen])

    const navToTabsManager = useCallback(async () => {
        await onNavigate?.()
        nav.replace(Routes.DISCOVER_TABS_MANAGER)
    }, [nav, onNavigate])

    const theme = useTheme()

    const animatedStyles = useAnimatedStyle(
        () => ({
            height: showToolbars ? withTiming(56) : withTiming(24),
        }),
        [showToolbars],
    )

    const onSubmit = useCallback(
        async (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
            const value = e.nativeEvent.text.toLowerCase()
            const isValid = await URIUtils.isValidBrowserUrl(value)
            if (isValid) {
                const url = URIUtils.parseUrl(value)
                onBrowserNavigation?.(false)
                navigateToUrl(url)
                if (selectedTabId) dispatch(updateTab({ id: selectedTabId, href: url }))
                return
            }
            onBrowserNavigation?.(true)
        },
        [dispatch, navigateToUrl, onBrowserNavigation, selectedTabId],
    )

    const renderWithToolbar = useMemo(() => {
        return (
            <BaseView style={styles.inputContainer}>
                {/* Icon on the left */}
                <BaseIcon
                    testID="URL-bar-back-button"
                    name="icon-arrow-left"
                    color={theme.colors.text}
                    action={navToDiscover}
                    haptics="Light"
                    size={24}
                    p={8}
                />

                {/* URL Text centered */}
                <BaseView flex={1} alignItems="center" flexDirection="row">
                    {isDapp ? (
                        <BaseView flex={0.9} flexDirection="row" alignItems="center" style={styles.dappContainer}>
                            <BaseIcon name="icon-lock" color={theme.colors.textLight} size={12} />

                            <BaseText
                                testID="URL-bar-dapp-name"
                                typographyFont="captionRegular"
                                color={theme.colors.subtitle}
                                numberOfLines={1}>
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

                <BaseTouchable onPress={navToTabsManager} testID="TABS_BTN">
                    <TabsIconSVG
                        count={tabs.length}
                        textColor={theme.colors.text}
                        color={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300}
                    />
                </BaseTouchable>
            </BaseView>
        )
    }, [
        isDapp,
        navToDiscover,
        navToTabsManager,
        navigationState?.url,
        onSubmit,
        tabs.length,
        theme.colors.subtitle,
        theme.colors.text,
        theme.colors.textLight,
        theme.isDark,
    ])

    const renderWithoutToolbar = useMemo(() => {
        return (
            <BaseView style={styles.noToolbarContainer}>
                <BaseText typographyFont="smallCaptionMedium" color={theme.colors.subtitle} numberOfLines={1}>
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
        paddingHorizontal: 16,
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
