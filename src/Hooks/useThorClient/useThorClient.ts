import { ThorClient } from "@vechain/sdk-network"
import { useMemo } from "react"
import { Network } from "~Model"
import { selectDefaultMainnet, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useNetworkThorClient = (network: Network) => {
    return useMemo(() => ThorClient.at(network.currentUrl), [network.currentUrl])
}

export const useThorClient = () => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    return useNetworkThorClient(selectedNetwork)
}

export const useMainnetThorClient = () => {
    const mainnet = useAppSelector(selectDefaultMainnet)

    return useNetworkThorClient(mainnet)
}
