import { queryClient } from "~Api/QueryProvider"
import { NFTMetadata } from "~Model/Nft/Nft"
import ArweaveUtils from "~Utils/ArweaveUtils"

export const getNFTMetadataArweave = async (uri: string) =>
    queryClient.fetchQuery(ArweaveUtils.getArweaveQueryKeyOptions<NFTMetadata>(uri, { responseType: "json" }))
