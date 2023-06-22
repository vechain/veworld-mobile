import Arweave from "arweave"
import { error } from "~Utils/Logger"
import { TokenMetadata } from "~Model/Nft/Nft"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"

const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: NFT_AXIOS_TIMEOUT, // Network request timeouts in milliseconds
    logging: false, // Disable network request logging
})

const toID = (uri: string) => uri.split("://")[1]

export const getTokenMetaArweave = async (uri: string) => {
    try {
        const id = toID(uri)

        const response = await arweave.api.get<TokenMetadata>(id)
        return response.data
    } catch (e) {
        error(e)
        throw e
    }
}

export const getImageUrlArweave = async (uri: string) => {
    try {
        const id = toID(uri)

        const res = await arweave.api.get<string>(id)

        return res.url
    } catch (e) {
        error(e)
        throw e
    }
}
