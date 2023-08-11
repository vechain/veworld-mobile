// Hook that allows you to access the current blockchain network properties

import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useBlockchainNetwork = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const isMainnet = network.type === "mainnet"

    return {
        network,
        isMainnet,
    }
}
