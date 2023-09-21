import { useCallback, useEffect, useState } from "react"
import { useThor } from "~Components"
import { VET } from "~Constants"
import { getTokenDecimals, getTokenName, getTokenSymbol } from "~Networking"
import { error as loggerError } from "~Utils"

/**
 * A custom hook that fetches basic information about fungible tokens.
 *
 * @param {string} [tokenAddress] - The address of the deployed token. If not provided, the hook won't fetch.
 * @returns {object} An object containing:
 *  - `name`: The name of the token (string | undefined).
 *  - `symbol`: The symbol of the token (string | undefined).
 *  - `decimals`: The decimals of the token (number | undefined).
 *  - `error`: Any error that might occur during fetching (Error | null).
 *  - `fetchData`: A function to fetch data given a token address. Returns an object with the same structure as the hook's return value.
 *
 * @example
 * ```typescript
 * const { symbol, decimals, fetchData } = useFungibleTokenInfo(tokenAddress);
 * fetchData(someOtherAddress).then(data => console.log(data.name, data.symbol, data.decimals));
 * ```
 *
 * Notes:
 * - If the provided `tokenAddress` is the same as `VET.address`, the hook won't make any fetching.
 * - The `fetchData` function is memoized with useCallback and is dependent on the `thor` context.
 */
export const useFungibleTokenInfo = (tokenAddress?: string) => {
    const [symbol, setSymbol] = useState<string>()
    const [decimals, setDecimals] = useState<number>()
    const [name, setName] = useState<string>()
    const [error, setError] = useState<Error | null>(null)

    const thor = useThor()

    useEffect(() => {
        if (tokenAddress === VET.address) return

        const fetchData = async () => {
            try {
                const resDecimals = await getTokenDecimals(tokenAddress!, thor)
                setDecimals(resDecimals)
                const resSymbol = await getTokenSymbol(tokenAddress!, thor)
                setSymbol(resSymbol)
                const resName = await getTokenName(tokenAddress!, thor)
                setName(resName)
            } catch (err) {
                setError(err as Error)
                loggerError("Error getting token info", err)
            }
        }

        tokenAddress && fetchData()
    }, [tokenAddress, thor])

    const fetchData = useCallback(
        async (_tokenAddress: string) => {
            const resDecimals = await getTokenDecimals(_tokenAddress, thor)

            const resSymbol = await getTokenSymbol(_tokenAddress, thor)

            const resName = await getTokenName(_tokenAddress, thor)

            return {
                name: resName,
                symbol: resSymbol,
                decimals: resDecimals,
            }
        },
        [thor],
    )

    return {
        name,
        symbol,
        decimals,
        error,
        address: tokenAddress,
        fetchData,
    }
}
