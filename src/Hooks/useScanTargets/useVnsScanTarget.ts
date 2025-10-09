import { useCallback } from "react"
import { useVns, ZERO_ADDRESS } from "~Hooks/useVns"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const useVnsScanTarget = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const { getVnsAddress, getVnsName } = useVns()

    const fetchVnsAddressFromName = useCallback(
        async (vetDomain: string) => {
            const address = await getVnsAddress(vetDomain)
            if (address === ZERO_ADDRESS) {
                return undefined
            }
            return address
        },
        [getVnsAddress],
    )

    const fetchVnsNameFromAddress = useCallback(
        async (address: string) => {
            const [{ name }] = await getVnsName(address)
            return name || undefined
        },
        [getVnsName],
    )

    return useCallback(
        async (data: string) => {
            const cachedVns = AddressUtils.loadVnsFromCache(data, network)
            if (cachedVns) {
                return { name: cachedVns.name, address: cachedVns.address }
            }
            if (data.endsWith(".vet")) {
                const vns = await fetchVnsAddressFromName(data)
                if (vns) return { name: data, address: vns.toLowerCase() }
            } else {
                const vns = await fetchVnsNameFromAddress(data)
                if (vns) return { name: vns, address: data.toLowerCase() }
            }
        },
        [fetchVnsAddressFromName, fetchVnsNameFromAddress, network],
    )
}
