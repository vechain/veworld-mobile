import { useQuery } from "@tanstack/react-query"
import { useThor } from "~Components"
import { selectSelectedAccountAddress, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useTokenBalanceConfig } from "./useTokenBalance.config"
import { useMemo } from "react"

export const useTokenBalance = ({
    address,
    tokenAddress,
    enabled = true,
}: {
    address?: string
    tokenAddress: string
    enabled?: boolean
}) => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const parsedAddress = useMemo(() => {
        return address ?? selectedAccountAddress!
    }, [address, selectedAccountAddress])
    const cfg = useMemo(
        // eslint-disable-next-line react-hooks/rules-of-hooks
        () => ({ ...useTokenBalanceConfig({ address: parsedAddress, tokenAddress, network, thor }), enabled }),
        [enabled, network, parsedAddress, thor, tokenAddress],
    )
    return useQuery(cfg)
}
