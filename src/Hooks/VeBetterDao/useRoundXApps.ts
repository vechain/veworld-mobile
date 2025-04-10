import { useQuery } from "@tanstack/react-query"
import { useThor } from "~Components"
import { abis, VEBETTER_DAO_XALLOCATION_VOTING_CONTRACT } from "~Constants"

/**
 * xApp type
 * @property id - the xApp id
 * @property teamWalletAddress - the xApp address
 * @property name - the xApp name
 * @property metadataURI - the xApp metadata URI
 * @property createdAtTimestamp - timestamp when xApp was added
 * @property isNew - whether the xApp is considered new as per {@link NEW_APP_PERIOD_SECONDS}
 */
export type XApp = {
    id: string
    teamWalletAddress: string
    name: string
    metadataURI: string
    createdAtTimestamp: string
    isNew: boolean
}

/**
 * Returns all the available xApps (apps that can be voted on for allocation)
 * @param thor  the thor client
 * @param roundId  the id of the round the get state for
 * @returns  all the available xApps (apps that can be voted on for allocation) capped to 256 see {@link XApp}
 */
export const getRoundXApps = async (thor: Connex.Thor, roundId?: string): Promise<XApp[]> => {
    if (!roundId) return []
    const currentRoundAbi = abis.VeBetterDao.XAllocationVoting.getAppsOfRound

    if (!currentRoundAbi) throw new Error("getXApps function not found")
    const res = await thor.account(VEBETTER_DAO_XALLOCATION_VOTING_CONTRACT).method(currentRoundAbi).call(roundId)

    if (res.vmError) return Promise.reject(new Error(res.vmError))

    const apps = res.decoded[0]
    return apps.map((app: any) => ({
        id: app[0],
        teamWalletAddress: app[1],
        name: app[2],
        metadataURI: app[3],
        createdAtTimestamp: app[4],
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
    const thor = useThor()

    return useQuery({
        queryKey: getRoundXAppsQueryKey(roundId),
        queryFn: async () => await getRoundXApps(thor, roundId),
        enabled: !!thor && !!roundId,
    })
}
