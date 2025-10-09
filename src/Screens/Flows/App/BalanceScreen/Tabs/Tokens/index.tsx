import React from "react"
import { BaseSpacer, BaseView } from "~Components"
import { VeBetterDaoCard } from "../../Components/VeBetterDao/VeBetterDaoCard"
import { BalanceActivity } from "../Activity/BalanceActivity"
import { TokensTopSection } from "./TokensTopSection"
import { AddTokensCard } from "../../Components/Tokens/AddTokensCard"
import { BannersCarousel } from "../../Components/BannerCarousel"
import { SCREEN_WIDTH } from "~Constants"

type Props = {
    isEmptyStateShown?: boolean
}

export const Tokens = ({ isEmptyStateShown = false }: Props) => {
    return (
        <BaseView flexDirection="column">
            <TokensTopSection />
            <AddTokensCard />
            <BaseSpacer height={32} />
            <BalanceActivity tab="TOKENS" />
            {!isEmptyStateShown && (
                <>
                    <BaseSpacer height={40} />
                    <BannersCarousel location="home_screen" baseWidth={SCREEN_WIDTH - 48} padding={0} />

                    <BaseSpacer height={40} />
                    <VeBetterDaoCard />
                </>
            )}
        </BaseView>
    )
}
