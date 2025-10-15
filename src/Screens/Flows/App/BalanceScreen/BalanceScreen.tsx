import React, { useCallback, useEffect, useMemo } from "react"
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { BaseSpacer, Layout } from "~Components"
import { COLORS } from "~Constants"
import { useFetchFeaturedDApps, usePrefetchAllVns, useThemedStyles } from "~Hooks"
import { useOfficialTokens } from "~Hooks/useOfficialTokens"
import {
    addOfficialTokens,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils } from "~Utils"
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

    const scrollY = useSharedValue(0)
    const contentOffsetY = useSharedValue(0)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { styles } = useThemedStyles(baseStyles)

    const { data: officialTokens } = useOfficialTokens()
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
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
                    style={styles.scrollViewRoot}
                    contentContainerStyle={styles.scrollViewContent}>
                    <AnimatedLinearGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.gradient}
                        locations={[0, 0.55, 1]}
                        angle={180}
                        useAngle>
                        <CurrentBalance />

                        <BaseSpacer height={6} />
                        <BaseSpacer height={24} />

                        {!isObservedAccount && <BalanceActions style={balanceActionsAnimatedStyles} />}

                        <BaseSpacer height={64} />
                    </AnimatedLinearGradient>

                    <TabRenderer onLayout={onLayout} />
                </Animated.ScrollView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        scrollViewRoot: { minHeight: "100%" },
        scrollViewContent: { flexGrow: 1 },
        gradient: { position: "relative", marginTop: 16 },
    })
