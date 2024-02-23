import Arweave from "arweave"
import { error } from "~Utils/Logger"
import { NFTMetadata } from "~Model/Nft/Nft"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { URIUtils } from "~Utils"
import { ERROR_EVENTS } from "~Constants"

const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: NFT_AXIOS_TIMEOUT, // Network request timeouts in milliseconds
    logging: false, // Disable network request logging
})

const toID = (uri: string) => uri?.split("://")[1]

export const getNFTMetadataArweave = async (uri: string) => {
    try {
        const url = URIUtils.convertUriToUrl(uri)
        const id = toID(url)
        let processedId

        // Some uris have the arweave.net/ prefix, some don't, so we need to remove it if it's there
        // otherwise the request will fail
        if (id.includes("arweave.net/")) {
            processedId = id.split("arweave.net/")[1]
        } else {
            processedId = id
        }

        const response = await arweave.api.get<NFTMetadata>(processedId)
        return response.data
    } catch (e) {
        error(ERROR_EVENTS.NFT, e)
        throw e
    }
}
