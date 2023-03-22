import React, { memo, useCallback, useMemo } from "react"
import { BaseSpacer, BaseView, useUserPreferencesEntity } from "~Components"
import { Header } from "./Header"
import { AccountsCarousel } from "./AccountsCarousel"
import { HomeScreenActions } from "./HomeScreenActions"
import { useAccountsList } from "~Common/Hooks/Entities"
import { Account, useRealm } from "~Storage"
import { AddressUtils } from "~Common"

type Props = {
    openAccountManagementSheet: () => void
}

export const HeaderView = memo(({ openAccountManagementSheet }: Props) => {
    const { store } = useRealm()
    const accounts = useAccountsList("visible == true")
    const userPref = useUserPreferencesEntity()

    const selectedAccountIndex = useMemo(
        () =>
            accounts.findIndex(account =>
                AddressUtils.compareAddresses(
                    userPref.selectedAccount?.address,
                    account.address,
                ),
            ),
        [userPref.selectedAccount, accounts],
    )

    const onAccountChange = useCallback(
        (account: Account) => {
            store.write(() => {
                userPref.selectedAccount = account
            })
        },
        [store, userPref],
    )

    return (
        <>
            <BaseView alignItems="center">
                <Header />
                <BaseSpacer height={20} />
                <AccountsCarousel
                    balanceVisible={userPref.balanceVisible}
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
