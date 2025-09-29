import { useMemo } from "react"
import { useTokenBalance } from "./useTokenBalance"

/**
 * Return the balance already parsed from `useTokenBalance` or 0 if the data is undefined
 * @param param0 Parameters
 * @returns The value of the balance
 */
export const useSimplifiedTokenBalance = (...args: Parameters<typeof useTokenBalance>) => {
    const returnValue = useTokenBalance(...args)

    return useMemo(() => ({ ...returnValue, data: returnValue.data?.balance ?? "0" }), [returnValue])
}
