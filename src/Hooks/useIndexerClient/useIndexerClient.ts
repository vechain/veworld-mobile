import { useMemo } from "react"
import { useIndexerUrl } from "~Hooks/useIndexerUrl"
import { Network } from "~Model"
import createFetchClient, { Client, Middleware } from "openapi-fetch"
import type { paths } from "~Generated/indexer/schema"
import { defaultMainNetwork } from "~Constants"
import { debug } from "~Utils"

const errorMiddleware: Middleware = {
    onResponse({ response, params }) {
        if (!response.ok) {
            debug(
                "INDEXER",
                `An error occurred at: ${response.url}. Returned status is: ${response.status} ${response.statusText}`,
                `Params sent: ${JSON.stringify(params)}`,
            )
            throw new Error(`${response.url}: ${response.status} ${response.statusText}`)
        }
    },
}

export type IndexerClient = Client<paths, `${string}/${string}`>

export const useIndexerClient = (network: Network) => {
    const indexerUrl = useIndexerUrl(network)
    return useMemo(() => {
        const client = createFetchClient<paths>({
            baseUrl: indexerUrl?.replace("/api/v1", ""),
            headers: {
                "x-project-id": "veworld-mobile",
            },
        })
        client.use(errorMiddleware)
        return client
    }, [indexerUrl])
}

export const useMainnetIndexerClient = () => {
    return useIndexerClient(defaultMainNetwork)
}
