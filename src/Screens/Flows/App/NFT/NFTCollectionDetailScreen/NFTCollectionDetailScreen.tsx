import React, { useCallback, useMemo, useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import { BaseView, Layout } from "~Components"
import { useNFTWithMetadata } from "./Hooks/useNFTWithMetadata"

import { NFTList } from "./Components"
import { isEmpty } from "lodash"
import { NetworkErrorView } from "../NFTScreen/Components/NetworkErrorView"
import { useCollectionSource } from "./Hooks/useCollectionSource"
import { NftLoader } from "../NFTScreen/Components/NftLoader"

type Props = NativeStackScreenProps<
    RootStackParamListNFT,
    Routes.NFT_COLLECTION_DETAILS
>

export const NFTCollectionDetailScreen = ({ route }: Props) => {
    const [
        onEndReachedCalledDuringMomentum,
        setEndReachedCalledDuringMomentum,
    ] = useState(true)

    const { anyCollection } = useCollectionSource(
        route.params.collectionAddress,
    )

    const { NFTs, fetchMoreNFTs, isLoading, error, hasNext } =
        useNFTWithMetadata(
            route.params.collectionAddress,
            onEndReachedCalledDuringMomentum,
            setEndReachedCalledDuringMomentum,
        )

    const onMomentumScrollBegin = useCallback(() => {
        setEndReachedCalledDuringMomentum(true)
    }, [])

    const renderNftList = useMemo(() => {
        if (!isEmpty(NFTs) && !isEmpty(anyCollection)) {
            return (
                <NFTList
                    collection={anyCollection}
                    isLoading={isLoading}
                    NFTs={NFTs}
                    fetchMoreNFTs={fetchMoreNFTs}
                    onMomentumScrollBegin={onMomentumScrollBegin}
                    hasNext={hasNext}
                />
            )
        }
    }, [
        NFTs,
        anyCollection,
        isLoading,
        fetchMoreNFTs,
        onMomentumScrollBegin,
        hasNext,
    ])

    const renderContent = useMemo(() => {
        if (!isEmpty(error) && isEmpty(NFTs)) return <NetworkErrorView />

        return (
            <NftLoader isLoading={isLoading && isEmpty(NFTs)}>
                {renderNftList}
            </NftLoader>
        )
    }, [error, NFTs, isLoading, renderNftList])

    return (
        <Layout
            safeAreaTestID="NFT_Collection_Detail_Screen"
            bodyWithoutScrollView={
                <BaseView flex={1} justifyContent="center">
                    {renderContent}
                </BaseView>
            }
        />
    )
}
