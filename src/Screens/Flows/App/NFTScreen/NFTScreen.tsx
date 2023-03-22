import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import React, { useRef } from "react"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { SafeAreaView } from "react-native-safe-area-context"
import { useMemoizedAnimation } from "../HomeScreen/Hooks/useMemoizedAnimation"
import { CollectionsList, ImportNftBar } from "./components"

export const NFTScreen = () => {
    const { NFTListEnter, NFTListExit } = useMemoizedAnimation()

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
                    entering={NFTListEnter}
                    exiting={NFTListExit}
                />
            </NestableScrollContainer>
        </>
    )
}
