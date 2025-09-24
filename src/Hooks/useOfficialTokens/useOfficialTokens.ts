import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { VeDelegate } from "~Constants"
import { Network, NETWORK_TYPE } from "~Model"
import { getTokensFromGithub } from "~Networking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getUseOfficialTokensQueryKey = (genesisId: string) => ["TOKENS", "OFFICIAL", genesisId]

const queryFn = async (network: Network) => {
    const tokens = await getTokensFromGithub({
        network,
    })

    // Add VeDelegate to the list of official tokens on mainnet
    // This is because VeDelegate is not really a ERC20 token
    if (network.type === NETWORK_TYPE.MAIN && !tokens.find(token => token.symbol === VeDelegate.symbol)) {
        tokens.push(VeDelegate)
    }

    return tokens
}

export const useOfficialTokens = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const queryKey = useMemo(() => getUseOfficialTokensQueryKey(network.genesis.id), [network.genesis.id])
    return useQuery({
        queryKey,
        queryFn: () => queryFn(network),
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    })
}
