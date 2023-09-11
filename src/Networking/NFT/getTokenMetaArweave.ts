import Arweave from "arweave"
import { error } from "~Utils/Logger"
import { NFTMetadata } from "~Model/Nft/Nft"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { URIUtils } from "~Utils"

const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: NFT_AXIOS_TIMEOUT, // Network request timeouts in milliseconds
    logging: false, // Disable network request logging
})

const toID = (uri: string) => uri?.split("://")[1]

export const getTokenMetaArweave = async (uri: string) => {
    try {
        const url = URIUtils.convertUriToUrl(uri)
        const id = toID(url)

        const response = await arweave.api.get<NFTMetadata>(id)
        return response.data
    } catch (e) {
        error("getTokenMetaArweave", e)
        throw e
    }
}
