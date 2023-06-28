import { useEffect, useState } from "react"
import { useThor } from "~Components"
import { VET } from "~Constants"
import { getTokenDecimals, getTokenSymbol } from "~Networking"
import { error } from "~Utils"

/**
 * React hook to fetch basic information about fungible tokens.
 *
 * @param {string} tokenAddress The address of the deployed token.
 * @returns An object containing the token's symbol and decimals.
 *
 * @example
 * const { symbol, decimals } = useFungibleTokenInfo(tokenAddress);
 */
export const useFungibleTokenInfo = (tokenAddress: string) => {
    const [symbol, setSymbol] = useState<string>()

    const [decimals, setDecimals] = useState<number>()

    const thor = useThor()
    /**
     * Fetches the token symbol and decimals
     * for the selected account
     */
    useEffect(() => {
        if (tokenAddress === VET.address) return

        getTokenDecimals(tokenAddress, thor)
            .then(res => {
                setDecimals(res)
            })
            .catch(err => {
                error("Error getting token decimals", err)
            })

        getTokenSymbol(tokenAddress, thor)
            .then(res => {
                setSymbol(res)
            })
            .catch(err => {
                error("Error getting token symbol", err)
            })
    }, [thor, tokenAddress])

    return {
        symbol,
        decimals,
    }
}
