import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NFTCollectionDetailScreen, NFTDetailScreen, NFTScreen } from "~Screens"
import { Routes } from "~Navigation/Enums"
import { NonFungibleToken } from "~Model"

export type RootStackParamListNFT = {
    [Routes.NFTS]: undefined
    [Routes.NFT_DETAILS]: { collectionData: any; nft: NonFungibleToken }
    [Routes.NFT_COLLECTION_DETAILS]: { collectionAddress: string }
}

const { Navigator, Group, Screen } =
    createNativeStackNavigator<RootStackParamListNFT>()

export const NFTStack = () => {
    return (
        <Navigator>
            <Group>
                <Screen
                    name={Routes.NFTS}
                    component={NFTScreen}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.NFT_DETAILS}
                    component={NFTDetailScreen}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.NFT_COLLECTION_DETAILS}
                    component={NFTCollectionDetailScreen}
                    options={{ headerShown: false }}
                />
            </Group>
        </Navigator>
    )
}
