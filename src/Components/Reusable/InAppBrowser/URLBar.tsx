import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { NativeSyntheticEvent, StyleSheet, TextInputSubmitEditingEventData } from "react-native"
import FastImage from "react-native-fast-image"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseIcon, BaseText, BaseTextInput, BaseView, useInAppBrowser } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { RootStackParamListBrowser, RootStackParamListHome, RootStackParamListSettings, Routes } from "~Navigation"
import { RootStackParamListApps } from "~Navigation/Stacks/AppsStack"
import { selectCurrentTabId, updateTab, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { URIUtils } from "~Utils"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { Spinner } from "../Spinner"

type Props = {
    onBrowserNavigation?: (error: boolean) => void
    onNavigate?: () => void | Promise<void>
    returnScreen?: Routes.DISCOVER | Routes.SETTINGS | Routes.HOME | Routes.ACTIVITY_STAKING | Routes.APPS
    isLoading?: boolean
    onOpenOptions?: () => void
}

const AnimatedBaseIcon = Animated.createAnimatedComponent(wrapFunctionComponent(BaseIcon))
const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))
const AnimatedBaseText = Animated.createAnimatedComponent(wrapFunctionComponent(BaseText))
const AnimatedFavicon = Animated.createAnimatedComponent(FastImage)

export const URLBar = ({
    onBrowserNavigation,
    onNavigate,
    returnScreen = Routes.DISCOVER,
    isLoading,
    onOpenOptions,
}: Props) => {
    const { showToolbars, navigationState, navigateToUrl, dappMetadata } = useInAppBrowser()
    const nav =
        useNavigation<
            NativeStackNavigationProp<
                RootStackParamListBrowser & RootStackParamListSettings & RootStackParamListHome & RootStackParamListApps
            >
        >()

    const selectedTabId = useAppSelector(selectCurrentTabId)
    const dispatch = useAppDispatch()

    const navToDiscover = useCallback(async () => {
        await onNavigate?.()
        nav.navigate(returnScreen)
    }, [nav, onNavigate, returnScreen])

    // const navToTabsManager = useCallback(async () => {
    //     await onNavigate?.()
    //     nav.replace(Routes.DISCOVER_TABS_MANAGER)
    // }, [nav, onNavigate])

    const theme = useTheme()

    const animatedStyles = useAnimatedStyle(
        () => ({
            height: showToolbars ? withTiming(56) : withTiming(24),
            marginBottom: showToolbars ? 0 : 8,
        }),
        [showToolbars],
    )

    const animatedIconStyles = useAnimatedStyle(() => ({
        opacity: withTiming(showToolbars ? 1 : 0, { duration: 400 }),
        transform: [{ scale: withTiming(showToolbars ? 1 : 0, { duration: 300 }) }],
    }))

    const animatedFaviconStyles = useAnimatedStyle(() => ({
        transform: [{ scale: withTiming(showToolbars ? 1 : 0.6, { duration: 300 }) }],
    }))

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

    return navigationState?.url ? (
        <Animated.View style={[styles.animatedContainer, animatedStyles]}>
            <AnimatedBaseView style={styles.inputContainer}>
                {/* Icon on the left */}
                <AnimatedBaseIcon
                    testID="URL-bar-back-button"
                    name="icon-x"
                    color={theme.colors.textReversed}
                    bg={COLORS.GREY_800}
                    action={navToDiscover}
                    haptics="Light"
                    size={16}
                    p={8}
                    style={[animatedIconStyles, styles.iconButton]}
                />

                {/* URL Text centered */}
                <AnimatedBaseView flex={1} alignItems="center" flexDirection="row" justifyContent="center" gap={8}>
                    {dappMetadata ? (
                        <>
                            {!isLoading ? (
                                <AnimatedFavicon
                                    source={{ uri: dappMetadata.icon, priority: FastImage.priority.high }}
                                    style={[animatedFaviconStyles, styles.favicon]}
                                />
                            ) : (
                                <Spinner color={theme.colors.textReversed} />
                            )}
                            <AnimatedBaseText
                                allowFontScaling={false}
                                typographyFont="bodySemiBold"
                                color={theme.colors.textReversed}
                                style={[styles.appName]}>
                                {dappMetadata.name}
                            </AnimatedBaseText>
                        </>
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
                </AnimatedBaseView>

                <AnimatedBaseIcon
                    name="icon-more-vertical"
                    color={theme.colors.textReversed}
                    bg={COLORS.GREY_800}
                    action={onOpenOptions}
                    haptics="Light"
                    size={16}
                    p={8}
                    style={[animatedIconStyles, styles.iconButton]}
                />
            </AnimatedBaseView>
        </Animated.View>
    ) : null
}

const styles = StyleSheet.create({
    animatedContainer: {
        opacity: 1,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: COLORS.GREY_700,
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
    favicon: {
        width: 24,
        height: 24,
        borderRadius: 4,
        transformOrigin: "center",
    },
    iconButton: {
        transformOrigin: "center",
    },
})
