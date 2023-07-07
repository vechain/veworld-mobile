import { useCallback } from "react"
import { useThor } from "~Components"
import { updateAccountBalances, useAppDispatch } from "~Storage/Redux"

export const useStateReconciliaiton = () => {
    const dispatch = useAppDispatch()
    const thor = useThor()

    const updateBalances = useCallback(
        async ({ accountAddress }: { accountAddress: string }) => {
            dispatch(updateAccountBalances(thor, accountAddress))
        },
        [dispatch, thor],
    )

    const updateNFTs = useCallback(async () => {}, [])

    return { updateBalances, updateNFTs }
}
