import { useMemo } from "react"
import { Network, NETWORK_TYPE } from "~Model"
import { selectIndexerUrls, useAppSelector } from "~Storage/Redux"

export const useIsIndexerNetwork = (network: Network) => {
    const indexerUrls = useAppSelector(selectIndexerUrls)
    return useMemo(() => {
        if (indexerUrls[network.genesis.id]) return true
        if (network.type === NETWORK_TYPE.MAIN) return true
        if (network.type === NETWORK_TYPE.TEST) return true
        return false
    }, [indexerUrls, network.genesis.id, network.type])
}
