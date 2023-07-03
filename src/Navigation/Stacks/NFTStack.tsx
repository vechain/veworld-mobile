import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    NFTCollectionDetailScreen,
    NFTDetailScreen,
    NFTScreen,
    SendNFTRecapScreen,
    SendNFTScreen,
} from "~Screens"
import { Routes } from "~Navigation/Enums"

export type RootStackParamListNFT = {
    [Routes.NFTS]: undefined
    [Routes.NFT_DETAILS]: {
        collectionAddress?: string
        nftTokenId: string
    }
    [Routes.NFT_COLLECTION_DETAILS]: { collectionAddress: string }
    [Routes.BLACKLISTED_COLLECTIONS]: undefined
    [Routes.SEND_NFT]: { contractAddress: string; tokenId: string }
    [Routes.SEND_NFT_RECAP]: {
        contractAddress: string
        tokenId: string
        receiverAddress: string
    }
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

                <Screen
                    name={Routes.SEND_NFT}
                    component={SendNFTScreen}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.SEND_NFT_RECAP}
                    component={SendNFTRecapScreen}
                    options={{ headerShown: false }}
                />
            </Group>
        </Navigator>
    )
}
