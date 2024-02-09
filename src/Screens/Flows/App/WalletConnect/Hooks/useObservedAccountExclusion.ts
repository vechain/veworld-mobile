import { useCallback, useEffect } from "react"
import { selectSelectedAccount, selectVisibleAccountsWithoutObserved, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"

export const useObservedAccountExclusion = ({
    openSelectAccountBottomSheet,
}: {
    openSelectAccountBottomSheet: () => void
}) => {
    const visibleAccounts = useAppSelector(selectVisibleAccountsWithoutObserved)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    useEffect(() => {
        if (AccountUtils.isObservedAccount(selectedAccount)) {
            openSelectAccountBottomSheet()
        }
    }, [openSelectAccountBottomSheet, selectedAccount])

    // This onSubmit function is used to intercept the actual onSubmit function in the DApp sign* screens
    const onSubmit = useCallback(
        (callback: () => void) => {
            if (AccountUtils.isObservedAccount(selectedAccount)) {
                openSelectAccountBottomSheet()
                return
            }

            callback()
        },
        [openSelectAccountBottomSheet, selectedAccount],
    )

    return {
        visibleAccounts,
        selectedAccount,
        onSubmit,
    }
}
