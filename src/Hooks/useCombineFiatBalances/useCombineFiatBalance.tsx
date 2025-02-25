import { useCallback } from "react"

export const useCombineFiatBalances = () => {
    const isAlmostZero = useCallback((b: string) => b?.includes("<"), [])

    const combineFiatBalances = useCallback(
        (balances: string[]) => {
            const areAlmostZero = balances?.every(isAlmostZero)
            const preSum = balances
                ?.map(b => (isAlmostZero(b) ? 0 : Number(b)))
                ?.reduce((sum, current) => sum + current, 0)

            const amount = areAlmostZero ? 0.01 : preSum

            const isNAN = Number.isNaN(amount)

            return { amount: isNAN ? 0 : amount, areAlmostZero }
        },
        [isAlmostZero],
    )

    return { combineFiatBalances }
}
