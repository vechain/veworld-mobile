// Hook that allows you to access the current blockchain network properties

import { NETWORK_TYPE } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useBlockchainNetwork = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const isMainnet = network.type === NETWORK_TYPE.MAIN

    return {
        network,
        isMainnet,
    }
}
