import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { useThorClient } from "~Hooks/useThorClient"
import { NetworkHardFork } from "~Model"
import {
    selectSelectedNetwork,
    selectSelectedNetworkHardfork,
    setNetworkHardFork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useIsGalactica = () => {
    const thorClient = useThorClient()
    const dispatch = useAppDispatch()
    const hardfork = useAppSelector(selectSelectedNetworkHardfork)
    const network = useAppSelector(selectSelectedNetwork)

    const isCachedGalactica = useMemo(() => hardfork >= NetworkHardFork.GALACTICA, [hardfork])

    const { data, isFetching } = useQuery({
        queryKey: ["LatestBlock"],
        queryFn: () => thorClient.blocks.getBlockCompressed("best"),
        staleTime: 10000,
        gcTime: 10000,
        enabled: !isCachedGalactica,
    })

    const isBlockchainGalactica = useMemo(() => Boolean(data?.baseFeePerGas), [data?.baseFeePerGas])

    useEffect(() => {
        if (isBlockchainGalactica) dispatch(setNetworkHardFork({ network, hardfork: NetworkHardFork.GALACTICA }))
    }, [dispatch, isBlockchainGalactica, network])

    const isGalactica = useMemo(
        () => isCachedGalactica || isBlockchainGalactica,
        [isBlockchainGalactica, isCachedGalactica],
    )

    return { isGalactica, loading: isFetching }
}
