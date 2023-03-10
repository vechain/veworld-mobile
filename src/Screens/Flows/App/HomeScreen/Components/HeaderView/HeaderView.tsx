import React, { memo } from "react"
import { BaseSpacer, BaseView } from "~Components"
import { Header } from "./Header"
import { AccountsCarousel } from "./AccountsCarousel"
import { TabbarHeader } from "./TabbarHeader"
import { ActionsList } from "./ActionsList"

type Props = {
    setActiveTab: React.Dispatch<React.SetStateAction<number>>
    activeTab: number
    openAccountManagementSheet: () => void
}

export const HeaderView = memo(
    ({ setActiveTab, activeTab, openAccountManagementSheet }: Props) => {
        return (
            <>
                <BaseView alignItems="center">
                    <Header />
                    <BaseSpacer height={20} />
                    <AccountsCarousel
                        openAccountManagementSheet={openAccountManagementSheet}
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
