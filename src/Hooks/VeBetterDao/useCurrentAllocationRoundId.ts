import { useQuery } from "@tanstack/react-query"
import { useThor } from "~Components"
import { abis } from "~Constants"

const XALLOCATIONVOTING_CONTRACT = "0x89A00Bb0947a30FF95BEeF77a66AEdE3842Fe5B7"

/**
 *
 * Returns the current roundId of allocations voting
 * @param thor  the thor client
 * @returns the current roundId of allocations voting
 */
export const getCurrentAllocationsRoundId = async (thor: Connex.Thor): Promise<string> => {
    const currentRoundAbi = abis.VeBetterDao.XAllocationVoting.currentRoundId

    if (!currentRoundAbi) throw new Error("currentRoundId function not found")
    const res = await thor.account(XALLOCATIONVOTING_CONTRACT).method(currentRoundAbi).call()

    if (res.vmError) return Promise.reject(new Error(res.vmError))

    return res.decoded[0]
}

export const getCurrentAllocationsRoundIdQueryKey = () => ["currentAllocationsRoundId"]

/**
 * Hook to get the current roundId of allocations voting
 * @returns  the current roundId of allocations voting
 */
export const useCurrentAllocationsRoundId = () => {
    const thor = useThor()

    return useQuery({
        queryKey: getCurrentAllocationsRoundIdQueryKey(),
        queryFn: async () => await getCurrentAllocationsRoundId(thor),
        enabled: !!thor,
    })
}
