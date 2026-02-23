import React from "react"
import { BaseSpacer, BaseView } from "~Components"
import { BalanceActivity } from "../Activity/BalanceActivity"
import { CollectiblesTopSection } from "./CollectiblesTopSection"

export const Collectibles = () => {
    return (
        <BaseView px={24} flexDirection="column">
            <CollectiblesTopSection />
            <BaseSpacer height={32} />
            <BalanceActivity tab="COLLECTIBLES" />
        </BaseView>
    )
}
