import React, { memo } from "react"
import { BaseSpacer, BaseView } from "~Components"
import { Device } from "~Storage"
import { Header } from "./Header"
import { AccountsCarousel } from "./AccountsCarousel"
import { TabbarHeader } from "./TabbarHeader"

type Props = {
    activeDevice: Device
    openBottomSheetMenu: () => void
    setActiveScreen: (activeScreen: number) => void
}

export const HeaaderView = memo(
    ({ activeDevice, openBottomSheetMenu, setActiveScreen }: Props) => {
        return (
            <>
                <BaseView align="center">
                    <Header action={openBottomSheetMenu} />
                    <BaseSpacer height={20} />
                    <AccountsCarousel accounts={activeDevice.accounts} />
                </BaseView>

                <BaseSpacer height={10} />
                <TabbarHeader action={setActiveScreen} />
                <BaseSpacer height={20} />
            </>
        )
    },
)
