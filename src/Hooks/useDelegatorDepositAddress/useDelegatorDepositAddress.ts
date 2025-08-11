import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { getDelegatorDepositAddress, isValidGenericDelegatorNetwork } from "~Networking/GenericDelegator"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useDelegatorDepositAddress = () => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const { data: delegatorAddressResponse, isLoading } = useQuery({
        queryKey: ["GenericDelegatorDepositAddress", selectedNetwork.type],
        queryFn: () => getDelegatorDepositAddress({ networkType: selectedNetwork.type }),
        enabled: isValidGenericDelegatorNetwork(selectedNetwork.type),
        placeholderData: keepPreviousData,
        refetchInterval: 24 * 60 * 60 * 1000, // 24 hours
    })

    const depositAccount = useMemo(() => {
        if (delegatorAddressResponse === undefined) return ""
        return (delegatorAddressResponse as unknown as { depositAccount: string }).depositAccount
    }, [delegatorAddressResponse])

    return {
        depositAccount,
        isLoading,
    }
}
