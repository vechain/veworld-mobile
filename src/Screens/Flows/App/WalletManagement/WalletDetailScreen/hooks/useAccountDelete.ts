import { useCallback, useState } from "react"
import { AccountWithDevice } from "~Model"
import { AddressUtils } from "~Utils"
import { showWarningToast } from "~Components"
import { useI18nContext } from "~i18n"
import {
    removeAccount,
    removeBalancesByAddress,
    selectAccounts,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useAccountDelete = () => {
    const { LL } = useI18nContext()
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const allAccounts = useAppSelector(selectAccounts)
    const dispatch = useAppDispatch()

    const [accountToRemove, setAccountToRemove] = useState<AccountWithDevice | undefined>(undefined)

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
            return showWarningToast({
                text1: LL.NOTIFICATION_FAILED_TO_REMOVE_ACCOUNT(),
            })

        if (isOnlyAccount(accountToRemove.rootAddress))
            return showWarningToast({
                text1: LL.NOTIFICATION_CANT_REMOVE_ONLY_ACCOUNT(),
                visibilityTime: 10000,
            })

        // [START] - Remove account
        dispatch(removeAccount(accountToRemove))
        // Remove balances for the account
        dispatch(removeBalancesByAddress({ network: selectedNetwork.type, accountAddress: accountToRemove.address }))
    }, [LL, isOnlyAccount, accountToRemove, dispatch, selectedNetwork])

    const handleAccountToRemove = useCallback(
        (account: AccountWithDevice) => {
            if (isOnlyAccount(account.rootAddress))
                return showWarningToast({
                    text1: LL.NOTIFICATION_CANT_REMOVE_ONLY_ACCOUNT(),
                    visibilityTime: 10000,
                })

            setAccountToRemove(account)
        },
        [LL, isOnlyAccount],
    )

    return {
        accountToRemove,
        setAccountToRemove: handleAccountToRemove,
        isOnlyAccount,
        deleteAccount,
    }
}
