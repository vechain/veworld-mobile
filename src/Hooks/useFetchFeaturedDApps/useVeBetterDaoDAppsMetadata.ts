import { useQuery } from "@tanstack/react-query"
import { getVeBetterDaoDAppMetadata } from "~Networking"

export const useVeBetterDaoDAppsMetadata = (url: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["DAPP_METADATA", url],
        queryFn: () => getVeBetterDaoDAppMetadata(url),
        enabled,
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60,
    })
}
