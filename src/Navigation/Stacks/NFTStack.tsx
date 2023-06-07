import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
    BlackListedCollectionsScreen,
    NFTCollectionDetailScreen,
    NFTDetailScreen,
    NFTScreen,
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
                    name={Routes.BLACKLISTED_COLLECTIONS}
                    component={BlackListedCollectionsScreen}
                    options={{
                        headerShown: false,
                        presentation: "modal",
                    }}
                />
            </Group>
        </Navigator>
    )
}
