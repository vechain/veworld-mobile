/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useMemo } from "react"
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { BaseSpacer, Layout, QRCodeBottomSheet } from "~Components"
import { COLORS } from "~Constants"
import { useBottomSheetModal } from "~Hooks"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { BalanceActions } from "./Components/Actions/BalanceActions"
import { CurrentBalance } from "./Components/Balance/CurrentBalance"
import { PullToRefresh } from "./Components/PullToRefresh"
import { Header } from "./Header"
import { TabRenderer } from "./Tabs/TabRenderer"

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

export const BalanceScreen = () => {
    const scrollY = useSharedValue(0)
    const contentOffsetY = useSharedValue(0)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { ref: qrCodeBottomSheetRef } = useBottomSheetModal()

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
        if (isObservedAccount) return [COLORS.BALANCE_BACKGROUND, COLORS.BALANCE_BACKGROUND, COLORS.BALANCE_BACKGROUND]
        return [COLORS.BALANCE_BACKGROUND, "rgba(29, 23, 58, 0.5)", "#423483"]
    }, [isObservedAccount])

    const balanceActionsAnimatedStyles = useAnimatedStyle(() => {
        return {
            marginTop: withTiming(isObservedAccount ? 0 : 12),
            height: isObservedAccount ? 0 : "auto",
            overflow: "hidden",
        }
    }, [isObservedAccount])

    return (
        <Layout
            bg={COLORS.BALANCE_BACKGROUND}
            noBackButton
            fixedHeader={
                <Header scrollY={scrollY} contentOffsetY={contentOffsetY} qrCodeBottomSheetRef={qrCodeBottomSheetRef} />
            }
            noMargin
            fixedBody={
                <Animated.ScrollView
                    refreshControl={<PullToRefresh />}
                    onScroll={onScroll}
                    layout={LinearTransition.duration(4000)}
                    style={{ minHeight: "100%" }}
                    contentContainerStyle={{ flexGrow: 1 }}>
                    <AnimatedLinearGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ position: "relative", marginTop: 16 }}
                        locations={[0, 0.55, 1]}
                        angle={180}
                        useAngle
                        layout={LinearTransition.duration(4000)}>
                        <CurrentBalance />

                        <BaseSpacer height={6} />
                        <BaseSpacer height={24} />

                        <BalanceActions
                            qrCodeBottomSheetRef={qrCodeBottomSheetRef}
                            style={balanceActionsAnimatedStyles}
                        />

                        <BaseSpacer height={64} />
                    </AnimatedLinearGradient>

                    <TabRenderer onLayout={onLayout} />
                    <QRCodeBottomSheet ref={qrCodeBottomSheetRef} />
                </Animated.ScrollView>
            }
        />
    )
}
