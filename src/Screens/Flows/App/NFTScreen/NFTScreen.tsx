import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import React, { useRef } from "react"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { SlideInLeft } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import { useMemoizedAnimation } from "~Common"
import { CollectionsList, ImportNftBar } from "./components"

export const NFTScreen = () => {
    const { animateEntering, animateExiting } = useMemoizedAnimation({
        enteringAnimation: new SlideInLeft(),
        enteringDelay: 200,
        enteringDuration: 200,
        exitingAnimation: new SlideInLeft(),
        exitingDelay: 0,
        exitingDuration: 200,
    })

    const paddingBottom = useBottomTabBarHeight()

    const visibleHeightRef = useRef<number>(0)

    return (
        <>
            <SafeAreaView />
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom }}
                onContentSizeChange={visibleHeight => {
                    visibleHeightRef.current = visibleHeight
                }}>
                <ImportNftBar />
                <CollectionsList
                    entering={animateEntering}
                    exiting={animateExiting}
                />
            </NestableScrollContainer>
        </>
    )
}
