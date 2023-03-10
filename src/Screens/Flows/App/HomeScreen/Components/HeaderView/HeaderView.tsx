import React, { memo, useCallback } from "react"
import { BaseSpacer, BaseView } from "~Components"
import { Header } from "./Header"
import { AccountsCarousel } from "./AccountsCarousel"
import { TabbarHeader } from "./TabbarHeader"
import { ActionsList } from "./ActionsList"
import { useAccountsList } from "~Common/Hooks/Entities"
import { Account, useRealm } from "~Storage"

type Props = {
    setActiveTab: React.Dispatch<React.SetStateAction<number>>
    activeTab: number
    openAccountManagementSheet: () => void
}

export const HeaderView = memo(
    ({ setActiveTab, activeTab, openAccountManagementSheet }: Props) => {
        const { store } = useRealm()
        const accounts = useAccountsList()

        const onAccountChange = useCallback(
            (account: Account) => {
                store.write(() => {
                    console.log(account)
                })
            },
            [store],
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
