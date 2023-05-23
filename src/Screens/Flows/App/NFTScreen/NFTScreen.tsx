import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import React, { useRef } from "react"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { BaseSafeArea, BaseSpacer } from "~Components"
import { CollectionsList, NftScreenHeader } from "./components"

export const NFTScreen = () => {
    const paddingBottom = useBottomTabBarHeight()
    const visibleHeightRef = useRef<number>(0)

    return (
        <BaseSafeArea grow={1}>
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom }}
                onContentSizeChange={visibleHeight => {
                    visibleHeightRef.current = visibleHeight
                }}>
                <NftScreenHeader />

                <BaseSpacer height={24} />

                <CollectionsList />
            </NestableScrollContainer>
        </BaseSafeArea>
    )
}
