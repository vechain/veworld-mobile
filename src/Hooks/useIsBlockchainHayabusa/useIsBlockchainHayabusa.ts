import { useQuery } from "@tanstack/react-query"
import { Address } from "@vechain/sdk-core"
import { useEffect, useMemo } from "react"
import { STAKER_CONTRACT_ADDRESS } from "~Constants"
import { useNetworkThorClient } from "~Hooks/useThorClient"
import { Network, NetworkHardFork } from "~Model"
import { selectSelectedNetworkHardfork, setHardFork, useAppDispatch, useAppSelector } from "~Storage/Redux"

export const useIsBlockchainHayabusa = (network: Network) => {
    const thorClient = useNetworkThorClient(network)
    const dispatch = useAppDispatch()
    const hardfork = useAppSelector(selectSelectedNetworkHardfork)

    const isCachedHayabusa = useMemo(() => hardfork >= NetworkHardFork.HAYABUSA, [hardfork])

    const { data, isLoading } = useQuery({
        queryKey: ["HAYABUSA_CHECK", network.genesis.id],
        queryFn: () => thorClient.accounts.getBytecode(Address.of(STAKER_CONTRACT_ADDRESS)).then(res => res.toString()),
        staleTime: 10000,
        gcTime: 10000,
        enabled: !isCachedHayabusa,
    })

    const isBlockchainHayabusa = useMemo(() => Boolean(data && data !== "0x"), [data])

    useEffect(() => {
        if (isBlockchainHayabusa) dispatch(setHardFork(NetworkHardFork.HAYABUSA))
    }, [data, dispatch, isBlockchainHayabusa])

    const isHayabusa = useMemo(() => isCachedHayabusa || isBlockchainHayabusa, [isBlockchainHayabusa, isCachedHayabusa])

    return { isHayabusa, loading: isLoading }
}
