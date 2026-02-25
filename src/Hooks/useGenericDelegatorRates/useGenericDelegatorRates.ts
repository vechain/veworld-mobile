import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { getGenericDelegatorRates, isValidGenericDelegatorNetwork } from "~Networking/GenericDelegator"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useGenericDelegatorRates = () => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const { data: ratesResponse, isLoading } = useQuery({
        queryKey: ["GenericDelegatorRates", selectedNetwork.type],
        queryFn: () => getGenericDelegatorRates({ networkType: selectedNetwork.type }),
        enabled: isValidGenericDelegatorNetwork(selectedNetwork.type),
        placeholderData: keepPreviousData,
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 1000, // 10 seconds
    })

    const rate = useMemo(() => {
        if (ratesResponse === undefined) return undefined
        return ratesResponse.rate
    }, [ratesResponse])

    const serviceFee = useMemo(() => {
        if (ratesResponse === undefined) return undefined
        return ratesResponse.serviceFee
    }, [ratesResponse])

    return {
        rate,
        serviceFee,
        isLoading,
    }
}
