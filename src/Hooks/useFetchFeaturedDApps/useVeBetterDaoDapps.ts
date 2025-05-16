import { useQuery } from "@tanstack/react-query"
import { VEBETTER_DAO_DAPPS_MAIN_ADDRESS } from "~Constants"
import { useMainnetThorClient } from "~Hooks/useThorClient"
import { getVeBetterDaoDapps } from "~Networking"

export const useVeBetterDaoDapps = (enabled = true) => {
    const thor = useMainnetThorClient()

    return useQuery({
        queryKey: ["VeBetterDao"],
        queryFn: () => getVeBetterDaoDapps(thor, VEBETTER_DAO_DAPPS_MAIN_ADDRESS),
        enabled: !!thor && enabled,
        placeholderData: [],
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60,
    })
}
