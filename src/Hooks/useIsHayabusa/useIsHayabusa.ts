import { ethers } from "ethers"
import { useMemo } from "react"
import { useFeatureFlags } from "~Components"
import { useIsBlockchainHayabusa } from "~Hooks/useIsBlockchainHayabusa"
import { Network, NETWORK_TYPE } from "~Model"

export const useIsHayabusa = (network: Network) => {
    const { isHayabusa } = useIsBlockchainHayabusa(network)
    const featureFlags = useFeatureFlags()

    const isValidNftContract = useMemo(() => {
        if ([NETWORK_TYPE.OTHER, NETWORK_TYPE.SOLO].includes(network.type)) return false
        const nftContract =
            featureFlags?.forks?.HAYABUSA?.stargate?.[
                network.type as Extract<NETWORK_TYPE, NETWORK_TYPE.MAIN | NETWORK_TYPE.TEST>
            ]?.nftContract
        if (!nftContract || nftContract === ethers.constants.AddressZero) return false
        return true
    }, [featureFlags?.forks?.HAYABUSA?.stargate, network.type])

    return useMemo(() => isHayabusa && isValidNftContract, [isHayabusa, isValidNftContract])
}
