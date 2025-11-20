import { useMemo } from "react"
import { useIndexerUrl } from "~Hooks/useIndexerUrl"
import { Network } from "~Model"
import createFetchClient from "openapi-fetch"
import type { paths } from "~Generated/indexer/schema"

export const useIndexerClient = (network: Network) => {
    const indexerUrl = useIndexerUrl(network)
    return useMemo(
        () =>
            createFetchClient<paths>({
                baseUrl: indexerUrl?.replace("/api/v1", ""),
                headers: {
                    "x-project-id": "VeWorld",
                },
            }),
        [indexerUrl],
    )
}
