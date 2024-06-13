import { useMemo } from "react"
import { VTHO } from "~Constants"
import { selectBalancesState, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useVTHO_HACK = (accountAddress: string) => {
    const balancesState = useAppSelector(selectBalancesState)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const vtho = useMemo(() => {
        const defaultVetWithBalance = {
            ...VTHO,
            balance: {
                balance: "0",
                accountAddress,
                tokenAddress: VTHO.address,
                isCustomToken: false,
            },
        }

        const netBalances = balancesState[selectedNetwork.type]
        if (!netBalances) return defaultVetWithBalance

        const balancesForAccount = netBalances[accountAddress]
        if (!balancesForAccount) return defaultVetWithBalance

        const balance = netBalances[accountAddress].find(_balance => _balance.tokenAddress === VTHO.address)

        if (!balance) return defaultVetWithBalance

        return {
            ...VTHO,
            balance,
        }
    }, [accountAddress, balancesState, selectedNetwork.type])

    return vtho
}
