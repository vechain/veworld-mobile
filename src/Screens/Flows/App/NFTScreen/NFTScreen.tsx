import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import React from "react"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { BaseSafeArea, BaseSpacer } from "~Components"
import { CollectionsList, NftScreenHeader } from "./components"

export const NFTScreen = () => {
    const paddingBottom = useBottomTabBarHeight()

    return (
        <BaseSafeArea grow={1}>
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom }}>
                <NftScreenHeader />

                <BaseSpacer height={24} />

                <CollectionsList />
            </NestableScrollContainer>
        </BaseSafeArea>
    )
}
