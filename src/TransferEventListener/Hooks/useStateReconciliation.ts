import { useCallback } from "react"
import { useThor } from "~Components"
import {
    refreshNFTs,
    updateAccountBalances,
    useAppDispatch,
} from "~Storage/Redux"

export const useStateReconciliation = () => {
    const dispatch = useAppDispatch()
    const thor = useThor()

    const updateBalances = useCallback(
        (params: { accountAddress: string }) => {
            dispatch(updateAccountBalances(thor, params.accountAddress))
        },
        [dispatch, thor],
    )

    const updateNFTs = useCallback(
        (params: { network: string; accountAddress: string }) => {
            dispatch(
                refreshNFTs({
                    network: params.network,
                    accountAddress: params.accountAddress,
                }),
            )
        },
        [dispatch],
    )

    return { updateBalances, updateNFTs }
}
