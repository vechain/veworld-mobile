import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NFTDetailScreen, NFTScreen } from "~Screens"
import { Routes } from "~Navigation/Enums"
import { NonFungibleToken } from "~Model"

export type RootStackParamListNFT = {
    [Routes.NFTS]: undefined
    [Routes.NFT_DETAILS]: { collectionData: any; nft: NonFungibleToken }
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
            </Group>
        </Navigator>
    )
}
