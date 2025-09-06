import { createStackNavigator } from "@react-navigation/stack"
import { TransactionClause } from "@vechain/sdk-core"
import React from "react"
import { useNavAnimation } from "~Hooks"
import { Device, FungibleTokenWithBalance } from "~Model"
import { Routes } from "~Navigation/Enums"
import {
    InsertAddressSendScreen,
    NFTCollectionDetailScreen,
    NFTDetailScreen,
    NFTScreen,
    ReportNFTTransactionScreen,
    SendNFTRecapScreen,
    WalletDetailScreen,
    WalletManagementScreen,
} from "~Screens"

export type RootStackParamListNFT = {
    [Routes.NFTS]: undefined
    [Routes.NFT_DETAILS]: {
        collectionAddress?: string
        nftTokenId: string
    }
    [Routes.NFT_COLLECTION_DETAILS]: { collectionAddress: string }
    [Routes.BLACKLISTED_COLLECTIONS]: undefined

    [Routes.INSERT_ADDRESS_SEND]: {
        token?: FungibleTokenWithBalance
        contractAddress?: string
        tokenId?: string
    }

    [Routes.SEND_NFT_RECAP]: {
        contractAddress: string
        tokenId: string
        receiverAddress: string
    }

    [Routes.REPORT_NFT_TRANSACTION_SCREEN]: {
        nftAddress: string
        transactionClauses: TransactionClause[]
    }

    [Routes.WALLET_MANAGEMENT]: undefined
    [Routes.WALLET_DETAILS]: { device: Device }
}

const { Navigator, Group, Screen } = createStackNavigator<RootStackParamListNFT>()

export const NFTStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator id="NftStack" screenOptions={{ headerShown: false, animationEnabled: animation !== "none" }}>
            <Group>
                <Screen name={Routes.NFTS} component={NFTScreen} options={{ headerShown: false }} />

                <Screen name={Routes.NFT_DETAILS} component={NFTDetailScreen} options={{ headerShown: false }} />

                <Screen
                    name={Routes.NFT_COLLECTION_DETAILS}
                    component={NFTCollectionDetailScreen}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.REPORT_NFT_TRANSACTION_SCREEN}
                    component={ReportNFTTransactionScreen}
                    options={{ headerShown: false }}
                />

                <Screen
                    name={Routes.INSERT_ADDRESS_SEND}
                    component={InsertAddressSendScreen}
                    options={{ headerShown: false }}
                />

                <Screen name={Routes.SEND_NFT_RECAP} component={SendNFTRecapScreen} options={{ headerShown: false }} />

                <Screen
                    name={Routes.WALLET_MANAGEMENT}
                    component={WalletManagementScreen}
                    options={{ headerShown: false }}
                />
                <Screen name={Routes.WALLET_DETAILS} component={WalletDetailScreen} options={{ headerShown: false }} />
            </Group>
        </Navigator>
    )
}
