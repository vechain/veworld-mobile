import { useCallback } from "react"
import { useThor } from "~Components"
import { updateAccountBalances, useAppDispatch } from "~Storage/Redux"

export const useStateReconciliaiton = () => {
    const dispatch = useAppDispatch()
    const thor = useThor()

    const stateReconciliationAction = useCallback(
        (params: { accountAddress: string }) => {
            dispatch(updateAccountBalances(thor, params.accountAddress))
        },
        [dispatch, thor],
    )

    return { stateReconciliationAction }
}
