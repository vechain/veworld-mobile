import { useQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { useDelegationExitDays } from "~Hooks"
import { getCollectibleMetadataOptions } from "~Hooks/useCollectibleMetadata"
import { useTokenURI } from "~Hooks/useCollectibleMetadata/useTokenURI"
import { useStargateConfig } from "~Hooks/useStargateConfig"
import { NodeInfo } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { StargateImage } from "../StargateImage"

export const StargateCarouselItemImage = ({ item }: { item: NodeInfo }) => {
    const network = useAppSelector(selectSelectedNetwork)
    const stargateConfig = useStargateConfig(network)

    const { data: tokenURI, isLoading: isTokenURILoading } = useTokenURI({
        address: stargateConfig.STARGATE_NFT_CONTRACT_ADDRESS,
        tokenId: item.nodeId,
    })

    // Use the unlocked version of the NFT image (without the status badge baked in)
    const unlockedTokenURI = useMemo(() => tokenURI?.replace(/_locked/, ""), [tokenURI])

    const metadataOpts = useMemo(
        () => getCollectibleMetadataOptions(unlockedTokenURI, isTokenURILoading),
        [isTokenURILoading, unlockedTokenURI],
    )

    const { data } = useQuery(metadataOpts)

    const isExiting = useMemo(() => item.delegationStatus === "EXITING", [item.delegationStatus])

    const { exitDays } = useDelegationExitDays({
        validatorId: item.validatorId,
        enabled: isExiting,
    })

    return (
        <StargateImage
            uri={data?.image}
            delegationStatus={item.delegationStatus}
            exitDays={isExiting ? exitDays : undefined}
        />
    )
}
