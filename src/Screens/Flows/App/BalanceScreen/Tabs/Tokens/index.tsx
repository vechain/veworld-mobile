import React from "react"
import { BaseSpacer, BaseView } from "~Components"
import { VeBetterDaoCard } from "../../Components/VeBetterDao/VeBetterDaoCard"
import { BalanceActivity } from "../Activity/BalanceActivity"
import { TokensTopSection } from "./TokensTopSection"
import { AddTokensCard } from "../../Components/Tokens/AddTokensCard"

export const Tokens = () => {
    return (
        <BaseView flexDirection="column">
            <TokensTopSection />
            <BaseSpacer height={32} />
            <AddTokensCard />
            <BalanceActivity tab="TOKENS" />
            <BaseSpacer height={40} />
            <VeBetterDaoCard />
        </BaseView>
    )
}
