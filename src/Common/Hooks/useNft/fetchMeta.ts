import {
    getImageUrlArweave,
    getImageUrlIpfs,
    getTokenMetaArweave,
    getTokenMetaIpfs,
} from "~Networking"
import { error } from "~Common/Logger"

enum URIProtocol {
    IPFS = "ipfs",
    ARWEAVE = "ar",
}

export const fetchMetadata = async (uri: string) => {
    try {
        const protocol = uri.split(":")[0]

        switch (protocol) {
            case URIProtocol.IPFS: {
                const tokenMetadata = await getTokenMetaIpfs(uri)
                const imageUrl = getImageUrlIpfs(tokenMetadata.image ?? "")
                return { tokenMetadata, imageUrl }
            }

            case URIProtocol.ARWEAVE: {
                const tokenMetadata = await getTokenMetaArweave(uri)
                const imageUrl = await getImageUrlArweave(uri)
                return { tokenMetadata, imageUrl }
            }

            default:
                return {}
        }
    } catch (e) {
        error(e)
    }
}
