import { StyleSheet } from "react-native"
import React, { useCallback, useMemo, useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import { BaseIcon, BaseSafeArea, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { useNavigation } from "@react-navigation/native"
import { useNFTWithMetadata } from "./Hooks/useNFTWithMetadata"

import { NFTList } from "./Components"
import { isEmpty } from "lodash"
import { NetworkErrorView } from "../NFTScreen/Components/NetworkErrorView"
import { useCollectionSource } from "./Hooks/useCollectionSource"
import { NftSkeleton } from "../NFTScreen/Components/NftSkeleton"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"

type Props = NativeStackScreenProps<
    RootStackParamListNFT,
    Routes.NFT_COLLECTION_DETAILS
>

export const NFTCollectionDetailScreen = ({ route }: Props) => {
    const nav = useNavigation()
    const theme = useTheme()

    const [
        onEndReachedCalledDuringMomentum,
        setEndReachedCalledDuringMomentum,
    ] = useState(true)

    const goBack = useCallback(() => nav.goBack(), [nav])

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

    const renderContent = useMemo(() => {
        if (!isEmpty(error) && isEmpty(NFTs)) return <NetworkErrorView />

        if (isLoading && isEmpty(NFTs))
            return (
                <NftSkeleton
                    numberOfChildren={NFT_PAGE_SIZE}
                    showMargin
                    isNFT
                />
            )

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
        error,
        fetchMoreNFTs,
        isLoading,
        hasNext,
        onMomentumScrollBegin,
    ])

    return (
        <BaseSafeArea grow={1} testID="NFT_Collection_Detail_Screen">
            <BaseView mx={20}>
                <BaseIcon
                    style={baseStyles.backIcon}
                    size={36}
                    name="chevron-left"
                    color={theme.colors.text}
                    action={goBack}
                />
            </BaseView>

            <BaseView flex={1} justifyContent="center">
                {renderContent}
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: -12,
        alignSelf: "flex-start",
    },
})
