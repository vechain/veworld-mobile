import { queryOptions } from "@tanstack/react-query"
import Arweave from "arweave"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import URIUtils from "~Utils/URIUtils"

export const arweaveInstance = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: NFT_AXIOS_TIMEOUT, // Network request timeouts in milliseconds
    logging: false, // Disable network request logging
})

const toArweaveID = (uri: string) => uri?.split("://")[1]

type ArweaveFetchConfig = RequestInit & {
    responseType?: "arraybuffer" | "json" | "text" | "webstream"
}

export const getArweaveValue = async <TData>(uri: string, config?: NoInfer<ArweaveFetchConfig>): Promise<TData> => {
    const url = URIUtils.convertUriToUrl(uri)
    const id = toArweaveID(url)
    let processedId

    // Some uris have the arweave.net/ prefix, some don't, so we need to remove it if it's there
    // otherwise the request will fail
    if (id.includes("arweave.net/")) {
        processedId = id.split("arweave.net/")[1]
    } else {
        processedId = id
    }

    const response = await arweaveInstance.api.get(processedId, config)
    return response.data
}

export const getArweaveQueryKeyOptions = <TData>(uri: string, config?: NoInfer<ArweaveFetchConfig>) =>
    queryOptions({
        queryKey: ["ARWEAVE_URI", "v1", uri],
        staleTime: Infinity,
        gcTime: Infinity,
        queryFn: () => getArweaveValue<TData>(uri, config),
        retry: 3,
    })
