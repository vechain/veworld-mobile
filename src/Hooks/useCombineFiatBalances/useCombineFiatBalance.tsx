import { useCallback } from "react"

export const useCombineFiatBalances = () => {
    const isAlmostZero = useCallback((b: string) => {
        if (b?.includes("<")) return true
        const numValue = Number(b)
        return !Number.isNaN(numValue) && numValue > 0 && numValue < 0.01
    }, [])

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
