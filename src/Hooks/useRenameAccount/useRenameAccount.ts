import { useCallback } from "react"
import {
    renameAccount,
    selectSelectedAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useRenameAccount = () => {
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const changeAccountAlias = useCallback(
        ({ newAlias }: { newAlias: string }) => {
            dispatch(
                renameAccount({
                    address: selectedAccount.address,
                    alias: newAlias,
                }),
            )
        },
        [dispatch, selectedAccount.address],
    )

    return { changeAccountAlias, selectedAccount }
}
