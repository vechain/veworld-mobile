import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useThorClient } from "~Hooks/useThorClient"

export const useIsGalactica = () => {
    const thorClient = useThorClient()

    const { data } = useQuery({
        queryKey: ["LatestBlock"],
        queryFn: () => thorClient.blocks.getBlockCompressed("best"),
    })

    const isGalactica = useMemo(() => Boolean(data?.baseFeePerGas), [data?.baseFeePerGas])

    return isGalactica
}
