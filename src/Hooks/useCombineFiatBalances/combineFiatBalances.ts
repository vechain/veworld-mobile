const isAlmostZero = (b: string) => {
    if (b?.includes("<")) return true
    const numValue = Number(b)
    return !Number.isNaN(numValue) && numValue > 0 && numValue < 0.01
}

/**
 * Combine fiat balances into a single balance amount. Also provides a boolean to indicate if it's almost zero
 * @param balances Balances to combine
 * @returns The amount (if almost 0 will return 0.01) and if it's almost zero
 */
export const combineFiatBalances = (balances: string[]) => {
    const areAlmostZero = balances?.every(isAlmostZero)
    const preSum = balances?.map(b => (isAlmostZero(b) ? 0 : Number(b)))?.reduce((sum, current) => sum + current, 0)

    const amount = areAlmostZero ? 0.01 : preSum

    const isNAN = Number.isNaN(amount)

    return { amount: isNAN ? 0 : amount, areAlmostZero }
}
