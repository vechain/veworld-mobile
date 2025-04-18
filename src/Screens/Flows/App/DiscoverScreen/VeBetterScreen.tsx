import React from "react"
import { BaseView } from "~Components"
import { BetterStats } from "./Components/BetterStats"

export const VeBetterScreen = () => {
    return (
        <BaseView px={16} flexDirection="column" mt={40}>
            <BetterStats />
        </BaseView>
    )
}
