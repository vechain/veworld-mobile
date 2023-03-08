import React, { memo } from "react"
import { BaseSpacer, BaseView } from "~Components"
import { Header } from "./Header"
import { AccountsCarousel } from "./AccountsCarousel"
import { TabbarHeader } from "./TabbarHeader"
import { ActionsList } from "./ActionsList"

type Props = {
    openAccountManagementSheet: () => void
    navigateToCreateWallet: () => void
}

export const HeaderView = memo(
    ({ openAccountManagementSheet, navigateToCreateWallet }: Props) => {
        return (
            <>
                <BaseView align="center">
                    <Header action={navigateToCreateWallet} />
                    <BaseSpacer height={20} />
                    <AccountsCarousel
                        openAccountManagementSheet={openAccountManagementSheet}
                    />
                </BaseView>

                <BaseSpacer height={10} />
                <TabbarHeader />
                <BaseSpacer height={20} />
                <ActionsList />
            </>
        )
    },
)
