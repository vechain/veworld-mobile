import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { isEmpty } from "lodash"
import React, { useCallback, useMemo, useState } from "react"
import { BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { useResetNFTStack } from "../hooks"
import { NetworkErrorView } from "../NFTScreen/Components/NetworkErrorView"
import { NftLoader } from "../NFTScreen/Components/NftLoader"

import { NFTList } from "./Components"
import { useCollectionSource } from "./Hooks/useCollectionSource"
import { useNFTWithMetadata } from "./Hooks/useNFTWithMetadata"

type Props = NativeStackScreenProps<RootStackParamListNFT, Routes.NFT_COLLECTION_DETAILS>

export const NFTCollectionDetailScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    useResetNFTStack()
    const [onEndReachedCalledDuringMomentum, setEndReachedCalledDuringMomentum] = useState(true)

    const { anyCollection } = useCollectionSource(route.params.collectionAddress)

    const { nfts, fetchMoreNFTs, isLoading, error, hasNext } = useNFTWithMetadata(
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
    }, [nfts, anyCollection, isLoading, fetchMoreNFTs, onMomentumScrollBegin, hasNext])

    const renderContent = useMemo(() => {
        if (!isEmpty(error) && isEmpty(nfts)) return <NetworkErrorView />

        return <NftLoader isLoading={isLoading && isEmpty(nfts)}>{renderNftList}</NftLoader>
    }, [error, isLoading, nfts, renderNftList])

    return (
        <Layout
            title={LL.BD_COLLECTION()}
            safeAreaTestID="NFT_Collection_Detail_Screen"
            fixedBody={
                <BaseView flex={1} justifyContent="center">
                    {renderContent}
                </BaseView>
            }
        />
    )
}
