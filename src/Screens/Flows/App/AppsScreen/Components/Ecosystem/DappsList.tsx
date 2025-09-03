import { useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useEffect, useRef } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet, Dimensions } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from "react-native-reanimated"
import { BaseSpacer } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { DappHorizontalCardSkeleton } from "~Screens/Flows/App/DiscoverScreen/Components/DappHorizontalCardSkeleton"
import { DAppHorizontalCardV2 } from "./DAppHorizontalCardV2"

const SCREEN_WIDTH = Dimensions.get("window").width

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

    const translateX = useSharedValue(0)
    const opacity = useSharedValue(1)

    useEffect(() => {
        if (!animationDirection) return

        const startTranslateX = animationDirection === "left" ? SCREEN_WIDTH : -SCREEN_WIDTH
        const exitTranslateX = animationDirection === "left" ? -SCREEN_WIDTH : SCREEN_WIDTH

        translateX.value = 0
        opacity.value = 1

        translateX.value = withTiming(exitTranslateX, {
            duration: 160,
            easing: Easing.out(Easing.quad),
        })
        opacity.value = withTiming(0.4, { duration: 160 })

        const timeoutId = setTimeout(() => {
            translateX.value = startTranslateX
            translateX.value = withTiming(
                0,
                {
                    duration: 230,
                    easing: Easing.out(Easing.quad),
                },
                finished => {
                    if (finished && onAnimationComplete) {
                        runOnJS(onAnimationComplete)()
                    }
                },
            )
            opacity.value = withTiming(1, { duration: 230 })
        }, 150)

        return () => clearTimeout(timeoutId)
    }, [animationDirection, translateX, opacity, onAnimationComplete])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
            opacity: opacity.value,
        }
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
