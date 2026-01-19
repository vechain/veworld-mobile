import React, { useCallback, useEffect, useMemo } from "react"
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import {
    BaseSpacer,
    Layout,
    ValidatorDelegationExitedBottomSheet,
    VersionChangelogBottomSheet,
    VersionUpdateAvailableBottomSheet,
} from "~Components"
import { COLORS } from "~Constants"
import { useFetchFeaturedDApps, usePrefetchAllVns, useThemedStyles } from "~Hooks"
import { useHomeCollectibles } from "~Hooks/useHomeCollectibles"
import { useOfficialTokens } from "~Hooks/useOfficialTokens"
import {
    addOfficialTokens,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { DeviceBackupBottomSheet, DeviceJailBrokenWarningModal } from "../HomeScreen/Components"
import { EnableNotificationsBottomSheet } from "../HomeScreen/Components/EnableNotificationsBottomSheet"
import { BalanceActions } from "./Components/Actions/BalanceActions"
import { CurrentBalance } from "./Components/Balance/CurrentBalance"
import { PullToRefresh } from "./Components/PullToRefresh"
import { Header } from "./Header"
import { TabRenderer } from "./Tabs/TabRenderer"

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

export const BalanceScreen = () => {
    //Pre fetch all VNS names and addresses
    usePrefetchAllVns()
    //DO NOT REMOVE THIS FROM HERE, OTHERWISE APPS WON'T BE LOADED
    useFetchFeaturedDApps()
    //Prefetch the collectibles so that you don't see loading when going on the page
    useHomeCollectibles()

    const scrollY = useSharedValue(0)
    const contentOffsetY = useSharedValue(0)
    const headerHeight = useSharedValue(100)

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const { styles } = useThemedStyles(baseStyles)
    const { data: officialTokens } = useOfficialTokens()
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (officialTokens?.length)
            dispatch(addOfficialTokens({ network: selectedNetwork.type, tokens: officialTokens }))
    }, [dispatch, officialTokens, selectedNetwork.type])

    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            contentOffsetY.value = e.nativeEvent.layout.y
        },
        [contentOffsetY],
    )

    const onHeaderLayout = useCallback(
        (e: LayoutChangeEvent) => {
            headerHeight.value = e.nativeEvent.layout.height
        },
        [headerHeight],
    )

    const onScroll = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollY.value = e.nativeEvent.contentOffset.y
        },
        [scrollY],
    )

    const isObservedAccount = useMemo(() => {
        return AccountUtils.isObservedAccount(selectedAccount)
    }, [selectedAccount])

    const colors = useMemo(() => {
        if (isObservedAccount)
            return [COLORS.APP_BACKGROUND_DARK, COLORS.APP_BACKGROUND_DARK, COLORS.APP_BACKGROUND_DARK]
        return [COLORS.APP_BACKGROUND_DARK, "rgba(29, 23, 58, 0.5)", "#423483"]
    }, [isObservedAccount])

    const balanceActionsAnimatedStyles = useAnimatedStyle(() => {
        return {
            marginTop: 12,
        }
    }, [isObservedAccount])

    const balanceScrollAnimationStyles = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [0, headerHeight.value * 1.5], [1, 0]),
            transform: [
                { scale: interpolate(scrollY.value, [0, headerHeight.value / 2], [1, 0.95]) },
                { rotateX: `${interpolate(scrollY.value, [0, headerHeight.value / 2], [0, 0.5])}deg` },
            ],
        }
    }, [scrollY.value])

    return (
        <Layout
            bg={COLORS.APP_BACKGROUND_DARK}
            noBackButton
            fixedHeader={<Header scrollY={scrollY} contentOffsetY={contentOffsetY} />}
            noMargin
            fixedBody={
                <Animated.ScrollView
                    refreshControl={<PullToRefresh />}
                    onScroll={onScroll}
                    stickyHeaderIndices={[0]}
                    style={styles.scrollViewRoot}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}>
                    <Animated.View>
                        <AnimatedLinearGradient
                            colors={colors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={[styles.gradient, balanceScrollAnimationStyles]}
                            locations={[0, 0.55, 1]}
                            angle={180}
                            onLayout={onHeaderLayout}
                            useAngle>
                            <CurrentBalance />

                            <BaseSpacer height={6} />
                            <BaseSpacer height={24} />

                            {!isObservedAccount && <BalanceActions style={balanceActionsAnimatedStyles} />}

                            <BaseSpacer height={64} />
                        </AnimatedLinearGradient>
                    </Animated.View>

                    <TabRenderer onLayout={onLayout} />
                    <DeviceBackupBottomSheet />
                    <DeviceJailBrokenWarningModal />
                    <EnableNotificationsBottomSheet />
                    <ValidatorDelegationExitedBottomSheet />
                    <VersionUpdateAvailableBottomSheet />
                    <VersionChangelogBottomSheet />
                </Animated.ScrollView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        scrollViewRoot: { minHeight: "100%" },
        scrollViewContent: { flexGrow: 1 },
        gradient: { position: "relative", marginTop: 16, transformOrigin: "center" },
    })
