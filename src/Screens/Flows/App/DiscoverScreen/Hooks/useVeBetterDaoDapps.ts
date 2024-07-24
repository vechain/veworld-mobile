import { useQuery } from "@tanstack/react-query"
import { useThor } from "~Components"
import { getVeBetterDaoDapps } from "~Networking"

export const useVeBetterDaoDapps = () => {
    const thor = useThor()

    return useQuery({
        queryKey: ["VeBetterDao"],
        queryFn: () => getVeBetterDaoDapps(thor),
        enabled: !!thor,
        placeholderData: [],
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60,
    })
}
