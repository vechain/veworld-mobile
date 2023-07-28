import { useCallback, useState } from "react"
import { AccountWithDevice } from "~Model"
import { AddressUtils } from "~Utils"
import { showWarningToast } from "~Components"
import { useI18nContext } from "~i18n"
import {
    removeAccount,
    selectAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useAccountDelete = () => {
    const { LL } = useI18nContext()

    const allAccounts = useAppSelector(selectAccounts)
    const dispatch = useAppDispatch()

    const [accountToRemove, setAccountToRemove] = useState<
        AccountWithDevice | undefined
    >(undefined)

    const isOnlyAccount = useCallback(
        (rootAddress: string) => {
            const sameDeviceAccounts = allAccounts.filter(acc =>
                AddressUtils.compareAddresses(acc.rootAddress, rootAddress),
            )

            return sameDeviceAccounts.length <= 1
        },
        [allAccounts],
    )

    const deleteAccount = useCallback(() => {
        if (!accountToRemove)
            return showWarningToast(LL.NOTIFICATION_FAILED_TO_REMOVE_ACCOUNT())

        if (isOnlyAccount(accountToRemove.rootAddress))
            return showWarningToast(
                LL.NOTIFICATION_CANT_REMOVE_ONLY_ACCOUNT(),
                undefined,
                undefined,
                undefined,
                10000,
            )

        // [START] - Remove account
        dispatch(removeAccount(accountToRemove))
    }, [LL, isOnlyAccount, accountToRemove, dispatch])

    return {
        accountToRemove,
        setAccountToRemove,
        isOnlyAccount,
        deleteAccount,
    }
}
