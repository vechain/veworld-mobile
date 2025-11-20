import { useMemo } from "react"
import { useIndexerUrl } from "~Hooks/useIndexerUrl"
import { Network } from "~Model"
import createFetchClient, { Middleware } from "openapi-fetch"
import type { paths } from "~Generated/indexer/schema"

const errorMiddleware: Middleware = {
    onResponse({ response }) {
        if (!response.ok) {
            throw new Error(`${response.url}: ${response.status} ${response.statusText}`)
        }
    },
}

export const useIndexerClient = (network: Network) => {
    const indexerUrl = useIndexerUrl(network)
    return useMemo(() => {
        const client = createFetchClient<paths>({
            baseUrl: indexerUrl?.replace("/api/v1", ""),
            headers: {
                "x-project-id": "VeWorld",
            },
        })
        client.use(errorMiddleware)
        return client
    }, [indexerUrl])
}
