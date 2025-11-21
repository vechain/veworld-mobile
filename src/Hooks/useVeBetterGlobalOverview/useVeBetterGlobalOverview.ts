import { useQuery } from "@tanstack/react-query"
import { fetchVeBetterGlobalOverview } from "~Networking"

export const useVeBetterGlobalOverview = () => {
    return useQuery({
        queryKey: ["VEBETTER", "GLOBAL_OVERVIEW"],
        queryFn: fetchVeBetterGlobalOverview,
        staleTime: 24 * 60 * 60 * 1000,
    })
}
