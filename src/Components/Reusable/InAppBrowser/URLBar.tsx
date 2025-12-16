import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { BaseIcon } from "~Components/Base/BaseIcon"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useGetDappMetadataFromUrl, useThemedStyles } from "~Hooks"
import { useDynamicAppLogo } from "~Hooks/useAppLogo"
import { useCloseBrowser } from "~Hooks/useCloseBrowser"
import { RootStackParamListHome, RootStackParamListSettings, Routes } from "~Navigation"
import { RootStackParamListApps } from "~Navigation/Stacks/AppsStack"
import { DAppUtils } from "~Utils/DAppUtils"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { DAppIcon } from "../DAppIcon"
import { Spinner } from "../Spinner"
import { BrowserBottomSheet } from "./BrowserBottomSheet"

type Props = {
    navigationUrl: string
    onNavigate: () => void | Promise<void>
    returnScreen?:
        | Routes.SETTINGS
        | Routes.HOME
        | Routes.ACTIVITY_STAKING
        | Routes.APPS
        | Routes.SWAP
        | Routes.COLLECTIBLES_COLLECTION_DETAILS
    isLoading?: boolean
}

const AnimatedBaseIcon = Animated.createAnimatedComponent(BaseIcon)
const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))
const AnimatedBaseText = Animated.createAnimatedComponent(wrapFunctionComponent(BaseText))
const AnimatedTouchable = Animated.createAnimatedComponent(wrapFunctionComponent(BaseTouchable))

export const URLBar = ({ onNavigate, returnScreen, isLoading, navigationUrl }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const dappMetadata = useGetDappMetadataFromUrl(navigationUrl)
    const fetchDynamicLogo = useDynamicAppLogo()

    const nav =
        useNavigation<
            NativeStackNavigationProp<RootStackParamListSettings & RootStackParamListHome & RootStackParamListApps>
        >()

    const { onOpen: openBottomSheet, ref: bottomSheetRef, onClose: closeBottomSheet } = useBottomSheetModal()

    const navigateBack = useCloseBrowser({ returnScreen, onNavigate })

    const navToSearch = useCallback(async () => {
        await onNavigate?.()
        nav.replace(Routes.APPS_SEARCH)
    }, [nav, onNavigate])

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
        return (
            <DAppIcon
                uri={parsedDappMetadata.icon}
                fallbackTestID="URL-bar-website-favicon"
                imageTestID="URL-bar-dapp-favicon"
                size={24}
            />
        )
    }, [parsedDappMetadata])

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
                        action={navigateBack}
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
const baseStyles = () =>
    StyleSheet.create({
        animatedContainer: {
            opacity: 1,
            alignItems: "center",
            flexDirection: "row",
            backgroundColor: COLORS.BALANCE_BACKGROUND,
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
        iconButton: {
            transformOrigin: "center",
        },
        spinner: {
            padding: 2,
        },
    })
