import { useQuery } from "@tanstack/react-query"
import { useMainnetIndexerClient } from "~Hooks/useIndexerClient"

export const useVeBetterGlobalOverview = () => {
    const indexer = useMainnetIndexerClient()
    return useQuery({
        queryKey: ["VEBETTER", "GLOBAL_OVERVIEW"],
        queryFn: () => indexer.GET("/api/v1/b3tr/actions/global/overview"),
        staleTime: 24 * 60 * 60 * 1000,
    })
}
