import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { abis, VEBETTER_DAO_XALLOCATION_VOTING_CONTRACT } from "~Constants"
import { useMainnetThorClient } from "~Hooks/useThorClient"

/**
 *
 * Returns the current roundId of allocations voting
 * @param thor  the thor client
 * @returns the current roundId of allocations voting
 */
export const getCurrentAllocationsRoundId = async (thor: ThorClient): Promise<string> => {
    const currentRoundAbi = abis.VeBetterDao.XAllocationVoting.currentRoundId

    if (!currentRoundAbi) throw new Error("currentRoundId function not found")
    const res = await thor.contracts
        .load(VEBETTER_DAO_XALLOCATION_VOTING_CONTRACT, [abis.VeBetterDao.XAllocationVoting.currentRoundId])
        .read.currentRoundId()

    return res[0].toString()
}

export const getCurrentAllocationsRoundIdQueryKey = () => ["currentAllocationsRoundId"]

/**
 * Hook to get the current roundId of allocations voting
 * @returns  the current roundId of allocations voting
 */
export const useCurrentAllocationsRoundId = () => {
    const thor = useMainnetThorClient()

    return useQuery({
        queryKey: getCurrentAllocationsRoundIdQueryKey(),
        queryFn: async () => await getCurrentAllocationsRoundId(thor),
        enabled: !!thor,
    })
}
