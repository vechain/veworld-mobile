/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useMemo } from "react"
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import LinearGradient from "react-native-linear-gradient"
import { useSharedValue } from "react-native-reanimated"
import { BaseSpacer, BaseView, Layout, QRCodeBottomSheet } from "~Components"
import { COLORS } from "~Constants"
import { useBottomSheetModal } from "~Hooks"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { BalanceActions } from "./Components/Actions/BalanceActions"
import { CurrentBalance } from "./Components/Balance/CurrentBalance"
import { PullToRefresh } from "./Components/PullToRefresh"
import { Header } from "./Header"
import { TabRenderer } from "./Tabs/TabRenderer"

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

    return (
        <Layout
            bg={COLORS.BALANCE_BACKGROUND}
            noBackButton
            fixedHeader={
                <Header scrollY={scrollY} contentOffsetY={contentOffsetY} qrCodeBottomSheetRef={qrCodeBottomSheetRef} />
            }
            noMargin
            fixedBody={
                <ScrollView refreshControl={<PullToRefresh />} onScroll={onScroll}>
                    {isObservedAccount ? (
                        <BaseView bg={COLORS.BALANCE_BACKGROUND}>
                            <CurrentBalance />

                            <BaseSpacer height={12} />
                            {/* The 24px container should be the pagination */}
                            <BaseSpacer height={24} />

                            <BaseSpacer height={64} />
                        </BaseView>
                    ) : (
                        <LinearGradient
                            colors={[COLORS.BALANCE_BACKGROUND, "rgba(29, 23, 58, 0.5)", "#423483"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={{ position: "relative", marginTop: 16 }}
                            locations={[0, 0.55, 1]}
                            angle={180}
                            useAngle>
                            <CurrentBalance />

                            <BaseSpacer height={12} />
                            {/* The 24px container should be the pagination */}
                            <BaseSpacer height={24} />
                            <BaseSpacer height={12} />

                            <BalanceActions qrCodeBottomSheetRef={qrCodeBottomSheetRef} />

                            <BaseSpacer height={64} />
                        </LinearGradient>
                    )}

                    <TabRenderer onLayout={onLayout} />
                    <QRCodeBottomSheet ref={qrCodeBottomSheetRef} />
                </ScrollView>
            }
        />
    )
}
