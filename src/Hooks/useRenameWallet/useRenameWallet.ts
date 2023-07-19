import { useCallback } from "react"
import {
    renameDevice,
    selectSelectedAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useRenameWallet = () => {
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const changeDeviceAlias = useCallback(
        ({ newAlias }: { newAlias: string }) => {
            dispatch(
                renameDevice({
                    rootAddress: selectedAccount.device.rootAddress,
                    alias: newAlias,
                }),
            )
        },
        [dispatch, selectedAccount.device.rootAddress],
    )

    return { changeDeviceAlias }
}
