import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { refreshNFTs, updateAccountBalances, useAppDispatch } from "~Storage/Redux"

export const useStateReconciliation = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const updateBalances = useCallback(
        (params: { accountAddress: string }) => {
            dispatch(updateAccountBalances(params.accountAddress, queryClient))
        },
        [dispatch, queryClient],
    )

    const updateNFTs = useCallback(
        (params: { network: string; accountAddress: string }) => {
            dispatch(
                refreshNFTs({
                    accountAddress: params.accountAddress,
                }),
            )
        },
        [dispatch],
    )

    return { updateBalances, updateNFTs }
}
