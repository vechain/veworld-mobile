import Arweave from "arweave"
import { ResponseWithData } from "arweave/web/lib/api"
import { useCallback } from "react"

import { error } from "~Common/Logger"
import { TokenMetadata } from "~Model/Nft/Nft"

const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000, // Network request timeouts in milliseconds
    logging: false, // Disable network request logging
})

export const useArweave = () => {
    const toID = (uri: string) => uri.split("://")[1]

    const getTokenMetadata = useCallback(
        async (uri: string): Promise<ResponseWithData<TokenMetadata>> => {
            try {
                const id = toID(uri)

                return await arweave.api.get<TokenMetadata>(id)
            } catch (e) {
                error(e)
                throw e
            }
        },
        [],
    )

    const getImageUrl = async (uri: string) => {
        try {
            const id = toID(uri)

            const res = await arweave.api.get<string>(id)

            return res.url
        } catch (e) {
            error(e)
            throw e
        }
    }

    return {
        getTokenMetadata,
        getImageUrl,
    }
}
