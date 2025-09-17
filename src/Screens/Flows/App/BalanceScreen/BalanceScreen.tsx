/* eslint-disable react-native/no-inline-styles */
import { default as React, useCallback } from "react"
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import LinearGradient from "react-native-linear-gradient"
import { useSharedValue } from "react-native-reanimated"
import { BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import { selectCurrencySymbol, useAppSelector } from "~Storage/Redux"
import { GlassButtonWithLabel } from "./Components/GlassButton"
import { PullToRefresh } from "./Components/PullToRefresh"
import { RollingFadingText } from "./Components/RollingFadingText"
import { Header } from "./Header"
import { TabRenderer } from "./Tabs/TabRenderer"

export const BalanceScreen = () => {
    const { LL } = useI18nContext()
    const currencySymbol = useAppSelector(selectCurrencySymbol)

    const scrollY = useSharedValue(0)
    const contentOffsetY = useSharedValue(0)

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

    return (
        <Layout
            bg={COLORS.BALANCE_BACKGROUND}
            noBackButton
            fixedHeader={<Header scrollY={scrollY} contentOffsetY={contentOffsetY} />}
            noMargin
            fixedBody={
                <ScrollView refreshControl={<PullToRefresh />} onScroll={onScroll}>
                    <LinearGradient
                        colors={[COLORS.BALANCE_BACKGROUND, "rgba(29, 23, 58, 0.50)", COLORS.PURPLE]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ position: "relative", marginTop: 16 }}
                        locations={[0, 0.6524, 1]}
                        angle={180}>
                        <BaseView flexDirection="row" gap={4} alignSelf="center">
                            <BaseText typographyFont="headerTitle" fontWeight="400" color={COLORS.PURPLE_LABEL}>
                                {currencySymbol}
                            </BaseText>
                            {/* This is just a placeholder for the loading state. Update it accordingly */}
                            <RollingFadingText text="99.999" />
                        </BaseView>

                        <BaseSpacer height={12} />
                        {/* The 24px container should be the pagination */}
                        <BaseSpacer height={24} />
                        <BaseSpacer height={12} />

                        <BaseView alignSelf="center" flexDirection="row" gap={24}>
                            <GlassButtonWithLabel label={LL.BALANCE_ACTION_BUY()} icon="icon-plus" onPress={() => {}} />
                            <GlassButtonWithLabel
                                label={LL.BALANCE_ACTION_RECEIVE()}
                                icon="icon-arrow-down"
                                onPress={() => {}}
                            />
                            <GlassButtonWithLabel
                                label={LL.BALANCE_ACTION_SEND()}
                                icon="icon-arrow-up"
                                onPress={() => {}}
                            />
                            <GlassButtonWithLabel
                                label={LL.BALANCE_ACTION_OTHER()}
                                icon="icon-more-vertical"
                                onPress={() => {}}
                            />
                        </BaseView>

                        <BaseSpacer height={64} />
                    </LinearGradient>

                    <TabRenderer onLayout={onLayout} />
                </ScrollView>
            }
        />
    )
}
