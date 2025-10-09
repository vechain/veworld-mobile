import { useCallback } from "react"
import { useVns, ZERO_ADDRESS } from "~Hooks/useVns"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const useVnsScanTarget = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const { getVnsAddress } = useVns()

    const fetchVns = useCallback(
        async (vetDomain: string) => {
            const address = await getVnsAddress(vetDomain)
            if (address === ZERO_ADDRESS) {
                return undefined
            }
            return address
        },
        [getVnsAddress],
    )

    return useCallback(
        async (data: string) => {
            const cachedVns = AddressUtils.loadVnsFromCache(data, network)
            if (cachedVns) {
                return { name: cachedVns.name, address: cachedVns.address }
            }
            const vns = await fetchVns(data)
            if (vns) return { name: data, address: vns.toLowerCase() }
        },
        [fetchVns, network],
    )
}
