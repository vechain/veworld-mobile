import { ThorClient } from "@vechain/sdk-network"
import { useMemo } from "react"
import { selectDefaultMainnet, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useThorClient = () => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const thorClient = useMemo(() => ThorClient.at(selectedNetwork.currentUrl), [selectedNetwork.currentUrl])
    return thorClient
}

export const useMainnetThorClient = () => {
    const mainnet = useAppSelector(selectDefaultMainnet)
    const thorClient = useMemo(() => ThorClient.at(mainnet.currentUrl), [mainnet.currentUrl])
    return thorClient
}
