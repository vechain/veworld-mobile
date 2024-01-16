import { useCallback } from "react"
import { Account } from "~Model"
import { renameAccount, useAppDispatch } from "~Storage/Redux"

export const useRenameAccount = (account: Account) => {
    const dispatch = useAppDispatch()

    const changeAccountAlias = useCallback(
        ({ newAlias }: { newAlias: string }) => {
            dispatch(
                renameAccount({
                    address: account.address,
                    alias: newAlias,
                }),
            )
        },
        [dispatch, account.address],
    )

    return { changeAccountAlias }
}
