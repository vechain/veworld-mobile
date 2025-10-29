import { ThorClient } from "@vechain/sdk-network"
import { ethers } from "ethers"
import { queryClient } from "~Api/QueryProvider"
import { ERROR_EVENTS } from "~Constants"
import { getCollectibleMetadataOptions } from "~Hooks/useCollectibleMetadata"
import { getCachedTokenURI } from "~Networking/NFT/getTokenURI"
import { debug } from "~Utils/Logger"

const ERC1155_URI_ABI_FRAGMENT = [
    {
        type: "function",
        name: "uri",
        stateMutability: "view",
        inputs: [{ name: "id", type: "uint256" }],
        outputs: [{ name: "", type: "string" }],
    },
] as const

export const parseAvatarRecord = async (
    record: string,
    { thor, genesisId }: { thor: ThorClient; genesisId: string },
) => {
    try {
        // Use the existing URI converter for direct URL handling
        if (record.startsWith("http") || record.startsWith("ipfs://") || record.startsWith("ar://")) {
            return record
        }

        // Handle NFT avatar (ENS-12)
        const match = /eip155:(\d+)\/(?:erc721|erc1155):([^/]+)\/(\d+)/.exec(record)

        if (!match) return null

        const [, chainId, contractAddress, tokenId] = match
        const isErc1155 = record.includes("erc1155")

        if (!chainId || !contractAddress || tokenId === undefined) {
            return null
        }

        let tokenUri = ""
        if (isErc1155) {
            const contract = thor.contracts.load(contractAddress, ERC1155_URI_ABI_FRAGMENT)
            const result = await contract.read.uri(BigInt(tokenId || 0))
            tokenUri = result[0].replace(
                "{id}",
                ethers.utils.hexZeroPad(ethers.utils.hexlify(BigInt(tokenId || 0)), 32).slice(2),
            )
        } else {
            const result = await getCachedTokenURI(BigInt(tokenId || 0).toString(), contractAddress, genesisId, thor)
            tokenUri = result
        }
        if (isErc1155) {
        }

        const metadata = await queryClient.fetchQuery(getCollectibleMetadataOptions(tokenUri))
        if (!metadata) {
            debug(ERROR_EVENTS.PROFILE, `[parseAvatarRecord]: Failed to fetch metadata from URI: ${tokenUri}`)
            return null
        }
        const imageUrl = metadata.image

        if (!imageUrl) {
            debug(ERROR_EVENTS.PROFILE, "[parseAvatarRecord]: No image URL in metadata.")
            return null
        }

        return imageUrl
    } catch {
        debug(ERROR_EVENTS.PROFILE, "[parseAvatarRecord]: Error while parsing avatar record.")
        return null
    }
}
