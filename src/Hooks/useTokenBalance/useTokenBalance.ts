import { useQuery } from "@tanstack/react-query"
import { useThor } from "~Components"
import { selectSelectedAccountAddress, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { getUseTokenBalanceConfig } from "./useTokenBalance.config"
import { useMemo } from "react"

type Args = {
    /**
     * Address of the user. If not defined, falls back to the selected account address
     */
    address?: string
    /**
     * Address of the token
     */
    tokenAddress: string
    /**
     * Boolean to indicate if the query is enabled or not.
     * @default true
     */
    enabled?: boolean
}

/**
 * Get the token balance for a specific token and an address. If the address is not specified, it'll fall back to the selected account.
 * @param param0 Parameters
 * @returns the token balance for the token specified by the address in the parameters
 */
export const useTokenBalance = ({ address, tokenAddress, enabled = true }: Args) => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const parsedAddress = useMemo(() => {
        return address ?? selectedAccountAddress!
    }, [address, selectedAccountAddress])
    const cfg = useMemo(
        () => ({ ...getUseTokenBalanceConfig({ address: parsedAddress, tokenAddress, network, thor }), enabled }),
        [enabled, network, parsedAddress, thor, tokenAddress],
    )
    return useQuery(cfg)
}
