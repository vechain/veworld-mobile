import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { Network } from "~Model"
import { invalidateUserTokens, updateAccountBalances, useAppDispatch } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const useStateReconciliation = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const updateBalances = useCallback(
        (params: { accountAddress: string }) => {
            dispatch(invalidateUserTokens(params.accountAddress, queryClient))
            dispatch(updateAccountBalances(params.accountAddress, queryClient))
        },
        [dispatch, queryClient],
    )

    const updateNFTs = useCallback(
        (params: { network: Network; accountAddress: string }) => {
            queryClient.invalidateQueries({
                predicate(query) {
                    const queryKey = query.queryKey as string[]
                    if (!["COLLECTIBLES"].includes(queryKey[0])) return false
                    if (queryKey.length < 4) return false
                    if (queryKey[2] !== params.network.genesis.id) return false
                    if (!AddressUtils.compareAddresses(queryKey[3], params.accountAddress)) return false
                    return true
                },
            })
        },
        [queryClient],
    )

    return { updateBalances, updateNFTs }
}
