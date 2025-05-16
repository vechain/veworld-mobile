import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { abis, VEBETTER_DAO_XALLOCATION_VOTING_CONTRACT } from "~Constants"
import { useMainnetThorClient } from "~Hooks/useThorClient"

/**
 * xApp type
 * @property id - the xApp id
 * @property teamWalletAddress - the xApp address
 * @property name - the xApp name
 * @property metadataURI - the xApp metadata URI
 * @property createdAtTimestamp - timestamp when xApp was added
 */
export type XApp = {
    id: string
    teamWalletAddress: string
    name: string
    metadataURI: string
    createdAtTimestamp: string
}

/**
 * Returns all the available xApps (apps that can be voted on for allocation)
 * @param thor  the thor client
 * @param roundId  the id of the round the get state for
 * @returns  all the available xApps (apps that can be voted on for allocation) capped to 256 see {@link XApp}
 */
export const getRoundXApps = async (thor: ThorClient, roundId?: string): Promise<XApp[]> => {
    if (!roundId) return []
    const currentRoundAbi = abis.VeBetterDao.XAllocationVoting.getAppsOfRound

    if (!currentRoundAbi) throw new Error("getXApps function not found")
    // const res = await thor.account(VEBETTER_DAO_XALLOCATION_VOTING_CONTRACT).method(currentRoundAbi).call(roundId)
    const res = await thor.contracts
        .load(VEBETTER_DAO_XALLOCATION_VOTING_CONTRACT, [abis.VeBetterDao.XAllocationVoting.getAppsOfRound])
        .read.getAppsOfRound(BigInt(roundId))

    const apps = res[0]
    return apps.map(app => ({
        ...app,
        id: app.id as string,
        createdAtTimestamp: app.createdAtTimestamp.toString(),
    }))
}

export const getRoundXAppsQueryKey = (roundId?: string) => ["round", roundId, "getXApps"]

/**
 *  Hook to get all the available xApps (apps that can be voted on for allocation)
 *
 *  @param roundId  the id of the round the get state for
 *
 *  @returns all the available xApps (apps that can be voted on for allocation) capped to 256
 */
export const useRoundXApps = (roundId?: string) => {
    const thor = useMainnetThorClient()

    return useQuery({
        queryKey: getRoundXAppsQueryKey(roundId),
        queryFn: async () => await getRoundXApps(thor, roundId),
        enabled: !!thor && !!roundId,
    })
}
