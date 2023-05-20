import axios from "axios"
import { useCallback } from "react"

import { error } from "~Common/Logger"
import { TokenMetadata } from "~Model/Nft/Nft"

export const useIpfs = () => {
    const toID = (uri: string) => uri.split("://")[1]

    const getTokenMetadata = useCallback(
        async (uri: string): Promise<TokenMetadata> => {
            try {
                const id = toID(uri)

                const metadata = await axios.get<TokenMetadata>(
                    `https://ipfs.io/ipfs/${id}`,
                )

                return metadata.data
            } catch (e) {
                error(e)
                throw e
            }
        },
        [],
    )

    const getImageUrl = (uri: string): string => {
        const id = toID(uri)
        return `https://ipfs.io/ipfs/${id}`
    }

    return {
        getTokenMetadata,
        getImageUrl,
    }
}
