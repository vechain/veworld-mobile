import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"
import { VET } from "~Constants"
import { useMainnetThorClient } from "~Hooks/useThorClient"
import { useTokenBalanceConfig } from "~Hooks/useTokenBalance"
import { NETWORK_TYPE } from "~Model"
import { selectAccountsWithoutObserved, selectNetworksByType, useAppSelector } from "~Storage/Redux"

export const useVetBalances = (enabled: boolean) => {
    const accounts = useAppSelector(selectAccountsWithoutObserved)
    const networks = useAppSelector(selectNetworksByType(NETWORK_TYPE.MAIN))
    const thor = useMainnetThorClient()

    const queryConfigs = useMemo(
        () =>
            accounts.map(account => ({
                // eslint-disable-next-line react-hooks/rules-of-hooks
                ...useTokenBalanceConfig({
                    address: account.address,
                    network: networks[0],
                    thor: thor,
                    tokenAddress: VET.address,
                }),
                enabled,
            })),
        [accounts, enabled, networks, thor],
    )
    return useQueries({
        queries: queryConfigs,
        combine(results) {
            return {
                data: results
                    .map(result => result.data)
                    .filter((balance): balance is NonNullable<typeof balance> => balance !== undefined),
            }
        },
    })
}
