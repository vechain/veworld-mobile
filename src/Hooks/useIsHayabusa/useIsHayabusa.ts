import { ethers } from "ethers"
import { useMemo } from "react"
import { useFeatureFlags } from "~Components"
import { useIsBlockchainHayabusa } from "~Hooks/useIsBlockchainHayabusa"
import { Network } from "~Model"
import { AddressUtils } from "~Utils"

export const useIsHayabusa = (network: Network) => {
    const { isHayabusa } = useIsBlockchainHayabusa(network)
    const featureFlags = useFeatureFlags()

    const isValidContract = useMemo(() => {
        if (!featureFlags?.forks?.HAYABUSA?.stargate?.[network.genesis.id]) return false
        const contract = featureFlags?.forks?.HAYABUSA?.stargate?.[network.genesis.id]?.contract
        if (!contract || AddressUtils.compareAddresses(ethers.constants.AddressZero, contract)) return false
        return true
    }, [featureFlags?.forks?.HAYABUSA?.stargate, network.genesis.id])

    return useMemo(() => isHayabusa && isValidContract, [isHayabusa, isValidContract])
}
