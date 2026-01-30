import { useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useRef } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseSpacer } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useContentSwipeAnimation } from "~Hooks"
import { DAppHorizontalCardV2 } from "./DAppHorizontalCardV2"
import { DappHorizontalCardSkeleton } from "./DappHorizontalCardSkeleton"

type Props = {
    items: DiscoveryDApp[]
    onOpenDApp: (dapp: DiscoveryDApp) => void
    onMorePress: (dapp: DiscoveryDApp) => void
    isLoading: boolean
    animationDirection?: "left" | "right" | null
    onAnimationComplete?: () => void
}

const keyExtractor = (dapp: DiscoveryDApp) => dapp.href

export const DAppsList = ({
    items,
    onMorePress,
    onOpenDApp,
    isLoading,
    animationDirection,
    onAnimationComplete,
}: Props) => {
    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const { animatedStyle } = useContentSwipeAnimation({
        animationDirection,
        onAnimationComplete,
    })

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<DiscoveryDApp>) => {
            return (
                <DAppHorizontalCardV2
                    dapp={item}
                    onOpenDApp={onOpenDApp}
                    onPress={() => {
                        onMorePress(item)
                    }}
                />
            )
        },
        [onMorePress, onOpenDApp],
    )

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={24} />
    }, [])

    const renderSkeletonItem = useCallback(() => {
        return <DappHorizontalCardSkeleton />
    }, [])

    if (isLoading) {
        return (
            <Animated.View style={animatedStyle}>
                <FlatList
                    renderItem={renderSkeletonItem}
                    data={[1, 2, 3, 4, 5, 6, 7]}
                    keyExtractor={item => item.toString()}
                    scrollEnabled={false}
                    shouldRasterizeIOS
                    windowSize={5}
                    ItemSeparatorComponent={renderItemSeparator}
                    contentContainerStyle={styles.flatListPadding}
                />
            </Animated.View>
        )
    }

    return (
        <Animated.View style={animatedStyle}>
            <Animated.FlatList
                ref={flatListRef}
                data={items}
                scrollEnabled={true}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.flatListPadding}
                ItemSeparatorComponent={renderItemSeparator}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                renderItem={renderItem}
                windowSize={5}
            />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    flatListPadding: { paddingBottom: 96 },
})
