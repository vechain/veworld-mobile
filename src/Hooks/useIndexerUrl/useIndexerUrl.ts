import { useMemo } from "react"
import { Network, NETWORK_TYPE } from "~Model"
import { selectIndexerUrls, useAppSelector } from "~Storage/Redux"

export const useIndexerUrl = (network: Network) => {
    const indexerUrls = useAppSelector(selectIndexerUrls)

    return useMemo(() => {
        if (indexerUrls[network.genesis.id]) return indexerUrls[network.genesis.id]
        if (network.type === NETWORK_TYPE.MAIN) return process.env.REACT_APP_INDEXER_MAINNET_URL!
        if (network.type === NETWORK_TYPE.TEST) return process.env.REACT_APP_INDEXER_TESTNET_URL!
        return null
    }, [indexerUrls, network.genesis.id, network.type])
}
