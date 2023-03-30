import React, { memo, useCallback, useMemo } from "react"
import { BaseSpacer, BaseView } from "~Components"
import { Header } from "./Header"
import { AccountsCarousel } from "./AccountsCarousel"
import { HomeScreenActions } from "./HomeScreenActions"
import { AddressUtils } from "~Common"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    getBalanceVisible,
    selectSelectedAccount,
    selectVisibleAccounts,
} from "~Storage/Redux/Selectors"
import { selectAccount } from "~Storage/Redux/Actions"
import { WalletAccount } from "~Model"

type Props = {
    openAccountManagementSheet: () => void
}

export const HeaderView = memo(({ openAccountManagementSheet }: Props) => {
    const accounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const balanceVisible = useAppSelector(getBalanceVisible)

    const dispatch = useAppDispatch()

    const selectedAccountIndex = useMemo(
        () =>
            accounts.findIndex(account =>
                AddressUtils.compareAddresses(
                    selectedAccount?.address,
                    account.address,
                ),
            ),
        [selectedAccount, accounts],
    )

    const onAccountChange = useCallback(
        (account: WalletAccount) => {
            dispatch(selectAccount({ address: account.address }))
        },
        [dispatch],
    )

    return (
        <>
            <BaseView alignItems="center">
                <Header />
                <BaseSpacer height={20} />
                <AccountsCarousel
                    balanceVisible={balanceVisible}
                    openAccountManagementSheet={openAccountManagementSheet}
                    accounts={accounts}
                    onAccountChange={onAccountChange}
                    selectedAccountIndex={selectedAccountIndex}
                />
            </BaseView>

            <BaseSpacer height={24} />
            <HomeScreenActions />
        </>
    )
})
