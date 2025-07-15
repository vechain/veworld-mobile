import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { B3TR, VET, VTHO } from "~Constants"
import { getGenericDelegatorCoins, isValidGenericDelegatorNetwork } from "~Networking/GenericDelegator"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useGenericDelegationTokens = () => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const { data, isFetching } = useQuery({
        queryKey: ["DelegationCoins", selectedNetwork.type],
        queryFn: () => getGenericDelegatorCoins({ networkType: selectedNetwork.type }),
        enabled: isValidGenericDelegatorNetwork(selectedNetwork.type),
    })

    const memoized = useMemo(() => {
        if (data === undefined) return { tokens: [VTHO.symbol], isLoading: isFetching }
        return {
            tokens: [VTHO.symbol, ...data].filter(token => [B3TR.symbol, VTHO.symbol, VET.symbol].includes(token)),
            isLoading: isFetching,
        }
    }, [data, isFetching])

    return memoized
}
