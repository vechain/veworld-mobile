import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useThorClient } from "~Hooks/useThorClient"

export const useIsGalactica = () => {
    const thorClient = useThorClient()

    const { data, isFetching } = useQuery({
        queryKey: ["LatestBlock"],
        queryFn: () => thorClient.blocks.getBlockCompressed("best"),
        staleTime: 10000,
        gcTime: 10000,
        refetchInterval: 3000,
    })

    const isGalactica = useMemo(() => Boolean(data?.baseFeePerGas), [data?.baseFeePerGas])

    return { isGalactica, loading: isFetching, blockId: data?.id }
}
