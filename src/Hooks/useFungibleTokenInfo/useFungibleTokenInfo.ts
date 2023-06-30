import { useEffect, useState } from "react"
import { useThor } from "~Components"
import { VET } from "~Constants"
import { getTokenDecimals, getTokenSymbol } from "~Networking"
import { error as loggerError } from "~Utils"

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
    const [error, setError] = useState<Error | null>(null)

    const thor = useThor()

    useEffect(() => {
        if (tokenAddress === VET.address) return

        const fetchData = async () => {
            try {
                const resDecimals = await getTokenDecimals(tokenAddress, thor)
                setDecimals(resDecimals)
                const resSymbol = await getTokenSymbol(tokenAddress, thor)
                setSymbol(resSymbol)
            } catch (err) {
                setError(err as Error)
                loggerError("Error getting token info", err)
            }
        }

        fetchData()
    }, [tokenAddress, thor])

    return {
        symbol,
        decimals,
        error,
    }
}
