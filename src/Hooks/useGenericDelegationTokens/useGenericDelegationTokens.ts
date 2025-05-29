import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { VTHO } from "~Constants"
import { NETWORK_TYPE } from "~Model"
import { fetchFromEndpoint } from "~Networking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useGenericDelegationTokens = () => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const delegatorBaseUrl = useMemo(
        () =>
            selectedNetwork.type === NETWORK_TYPE.MAIN
                ? process.env.REACT_APP_GENERIC_DELEGATOR_MAINNET_URL
                : process.env.REACT_APP_GENERIC_DELEGATOR_TESTNET_URL,
        [selectedNetwork.type],
    )
    const delegatorUrl = useMemo(() => `${delegatorBaseUrl}/delegator/coins`, [delegatorBaseUrl])
    const { data } = useQuery({
        queryKey: ["DelegationCoins", selectedNetwork.type],
        queryFn: () => fetchFromEndpoint<string[]>(delegatorUrl),
        enabled: [NETWORK_TYPE.MAIN, NETWORK_TYPE.TEST].includes(selectedNetwork.type),
    })

    const memoized = useMemo(() => {
        if (typeof data === "undefined") return [VTHO.symbol]
        return [VTHO.symbol, ...data]
    }, [data])

    return memoized
}
