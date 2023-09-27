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

    const { nfts, fetchMoreNFTs, isLoading, error, hasNext } =
        useNFTWithMetadata(
            route.params.collectionAddress,
            onEndReachedCalledDuringMomentum,
            setEndReachedCalledDuringMomentum,
        )

    const onMomentumScrollBegin = useCallback(() => {
        setEndReachedCalledDuringMomentum(true)
    }, [])

    const renderNftList = useMemo(() => {
        if (!isEmpty(nfts) && !isEmpty(anyCollection)) {
            return (
                <NFTList
                    collection={anyCollection}
                    isLoading={isLoading}
                    nfts={nfts}
                    fetchMoreNFTs={fetchMoreNFTs}
                    onMomentumScrollBegin={onMomentumScrollBegin}
                    hasNext={hasNext}
                />
            )
        }
    }, [
        nfts,
        anyCollection,
        isLoading,
        fetchMoreNFTs,
        onMomentumScrollBegin,
        hasNext,
    ])

    const renderContent = useMemo(() => {
        if (!isEmpty(error) && isEmpty(nfts)) return <NetworkErrorView />

        if (isLoading && isEmpty(nfts)) {
            return <NftLoader isLoading={isLoading && isEmpty(nfts)} />
        } else {
            return renderNftList
        }
    }, [error, isLoading, nfts, renderNftList])

    return (
        <Layout
            safeAreaTestID="NFT_Collection_Detail_Screen"
            fixedBody={
                <BaseView flex={1} justifyContent="center">
                    {renderContent}
                </BaseView>
            }
        />
    )
}
