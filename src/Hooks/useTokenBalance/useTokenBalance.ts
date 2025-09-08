import { useQuery } from "@tanstack/react-query"
import { useThor } from "~Components"
import { selectSelectedAccountAddress, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useTokenBalanceConfig } from "./useTokenBalance.config"
import { useMemo } from "react"

export const useTokenBalance = ({ address, tokenAddress }: { address?: string; tokenAddress: string }) => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const parsedAddress = useMemo(() => {
        return address ?? selectedAccountAddress!
    }, [address, selectedAccountAddress])
    return useQuery(useTokenBalanceConfig({ address: parsedAddress, tokenAddress, network, thor }))
}
