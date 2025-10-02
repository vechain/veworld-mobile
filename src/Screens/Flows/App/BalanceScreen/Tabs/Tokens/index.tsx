import React from "react"
import { BaseSpacer, BaseView } from "~Components"
import { VeBetterDaoCard } from "../../Components/VeBetterDao/VeBetterDaoCard"
import { BalanceActivity } from "../Activity/BalanceActivity"
import { TokensTopSection } from "./TokensTopSection"

export const Tokens = () => {
    return (
        <BaseView flexDirection="column">
            <TokensTopSection />
            <BaseSpacer height={32} />
            <BalanceActivity tab="TOKENS" />
            <BaseSpacer height={40} />
            <VeBetterDaoCard />
        </BaseView>
    )
}
