import React, { useMemo } from "react"
import { Animated, StyleSheet } from "react-native"
import { NFTMedia, NFTTransferCardSkeleton } from "~Components"
import { useNFTSendContext } from "~Components/Reusable/Send"
import { useCollectibleDetails } from "~Hooks/useCollectibleDetails"
import { useI18nContext } from "~i18n"
import { NFTDetailsContainer } from "./NFTDetailsContainer"

export const NFTReceiverCard = () => {
    const { flowState } = useNFTSendContext()
    const { LL } = useI18nContext()

    const collectible = useCollectibleDetails({
        address: flowState.contractAddress,
        tokenId: flowState.tokenId,
    })

    const isLoading = !collectible.collectionName

    const validatedCollectionName = collectible.collectionName ?? LL.UNKNOWN_COLLECTION()
    const validatedTokenId = flowState.tokenId

    const renderMedia = useMemo(() => {
        if (isLoading) return <NFTTransferCardSkeleton />

        return <NFTMedia uri={collectible.image ?? ""} styles={styles.nftImage} />
    }, [isLoading, collectible.image])

    return (
        <Animated.View>
            <NFTDetailsContainer>
                <NFTDetailsContainer.NFTInfo
                    nftImage={renderMedia}
                    collectionName={validatedCollectionName}
                    tokenId={validatedTokenId}
                    isLoading={isLoading}
                />
                <NFTDetailsContainer.Receiver address={flowState.address!} />
            </NFTDetailsContainer>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    nftImage: {
        overflow: "hidden",
        borderRadius: 8,
        width: 112,
        height: 112,
    },
})
