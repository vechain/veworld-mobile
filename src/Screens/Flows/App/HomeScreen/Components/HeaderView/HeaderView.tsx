import React, { memo, useCallback, useMemo } from "react"
import { BaseSpacer, BaseView } from "~Components"
import { Header } from "./Header"
import { AccountsCarousel } from "./AccountsCarousel"
import { TabbarHeader } from "./TabbarHeader"
import { ActionsList } from "./ActionsList"
import {
    useAccountsList,
    useUserPreferencesEntity,
} from "~Common/Hooks/Entities"
import { Account, useRealm } from "~Storage"
import { AddressUtils } from "~Common"

type Props = {
    setActiveTab: React.Dispatch<React.SetStateAction<number>>
    activeTab: number
    openAccountManagementSheet: () => void
}

export const HeaderView = memo(
    ({ setActiveTab, activeTab, openAccountManagementSheet }: Props) => {
        const { store } = useRealm()
        const accounts = useAccountsList("visible == true")
        const { selectedAccount, userPreferencesEntity } =
            useUserPreferencesEntity()

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
            (account: Account) => {
                store.write(() => {
                    userPreferencesEntity.selectedAccount = account
                })
            },
            [store, userPreferencesEntity],
        )
        return (
            <>
                <BaseView align="center">
                    <Header />
                    <BaseSpacer height={20} />
                    <AccountsCarousel
                        openAccountManagementSheet={openAccountManagementSheet}
                        accounts={accounts}
                        onAccountChange={onAccountChange}
                        selectedAccountIndex={selectedAccountIndex}
                    />
                </BaseView>

                <BaseSpacer height={10} />
                <TabbarHeader
                    setActiveTab={setActiveTab}
                    activeTab={activeTab}
                />
                <BaseSpacer height={20} />
                <ActionsList />
            </>
        )
    },
)
