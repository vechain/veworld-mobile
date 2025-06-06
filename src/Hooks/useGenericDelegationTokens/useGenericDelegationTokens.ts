import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { B3TR, VET, VTHO } from "~Constants"
import { getGenericDelegatorCoins, isValidGenericDelegatorNetwork } from "~Networking/GenericDelegator"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useGenericDelegationTokens = () => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const { data } = useQuery({
        queryKey: ["DelegationCoins", selectedNetwork.type],
        queryFn: () => getGenericDelegatorCoins({ networkType: selectedNetwork.type }),
        enabled: isValidGenericDelegatorNetwork(selectedNetwork.type),
    })

    const memoized = useMemo(() => {
        if (typeof data === "undefined") return [VTHO.symbol]
        return [VTHO.symbol, ...data].filter(token => [B3TR.symbol, VTHO.symbol, VET.symbol].includes(token))
    }, [data])

    return memoized
}
