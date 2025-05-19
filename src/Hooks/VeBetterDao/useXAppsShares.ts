import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { abis, VEBETTER_DAO_ALLOCATION_POOL_CONTRACT } from "~Constants"
import { useMainnetThorClient } from "~Hooks/useThorClient"

/**
 *  Get the clauses to get the votes for the xApps in an allocation round
 * @param thor ThorClient to use
 * @param apps the xApps to get the votes for
 * @param roundId  the round id to get the votes for
 * @returns  the clauses to get the votes for the xApps in the round
 */
export const getAppsShareClauses = (thor: ThorClient, apps: string[], roundId?: string) => {
    const loadedContract = thor.contracts.load(VEBETTER_DAO_ALLOCATION_POOL_CONTRACT, [
        abis.VeBetterDao.XAllocationPool.getAppShares,
    ])
    return apps.map(app => loadedContract.clause.getAppShares(BigInt(roundId!), app as `0x${string}`))
}

/**
 *  Returns the query key for the shares of multiple xApps in an allocation round.
 * @param roundId  the roundId the get the shares for
 */
export const getXAppsSharesQueryKey = (roundId?: number | string) => [roundId, "ALL"]

/**
 * Fetch shares of multiple xApps in an allocation round
 * @param apps  the xApps to get the shares for
 * @param roundId  the round id to get the shares for
 * @returns  the shares (% of allocation pool) for the xApps in the round { allocated: number, unallocated: number }
 *
 */
export const useXAppsShares = (apps: string[], roundId?: string) => {
    const thor = useMainnetThorClient()
    return useQuery({
        queryKey: getXAppsSharesQueryKey(roundId),
        queryFn: async () => {
            const clauses = getAppsShareClauses(thor, apps, roundId)

            const res = await thor.transactions.executeMultipleClausesCall(clauses)

            const votes = res.map((r, index) => {
                if (!r.success) throw new Error(`Clause ${index + 1} reverted with reason ${r.result.errorMessage}`)
                return {
                    app: apps[index],
                    share: Number(r.result.array?.[0] || 0) / 100,
                    unallocatedShare: Number(r.result.array?.[1] || 0) / 100,
                }
            })
            return votes
        },
        enabled: !!roundId && !!apps.length,
    })
}
