import React, { memo } from "react"
import { BaseSpacer, BaseView } from "~Components"
import { Header } from "./Header"
import { AccountsCarousel } from "./AccountsCarousel"
import { TabbarHeader } from "./TabbarHeader"
import { ActionsList } from "./ActionsList"

type Props = {
    openBottomSheetMenu: () => void
    setActiveTab: React.Dispatch<React.SetStateAction<number>>
    activeTab: number
}

export const HeaderView = memo(
    ({ openBottomSheetMenu, setActiveTab, activeTab }: Props) => {
        return (
            <>
                <BaseView align="center">
                    <Header action={openBottomSheetMenu} />
                    <BaseSpacer height={20} />
                    <AccountsCarousel />
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
