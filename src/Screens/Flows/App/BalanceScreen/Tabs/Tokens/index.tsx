import React from "react"
import { BaseSpacer, BaseView } from "~Components"
import { VeBetterDaoCard } from "../../Components/VeBetterDao/VeBetterDaoCard"
import { BalanceActivity } from "../Activity/BalanceActivity"
import { TokensTopSection } from "./TokensTopSection"
import { AddTokensCard } from "../../Components/Tokens/AddTokensCard"
import { BannersCarousel } from "../../Components/BannerCarousel"
import { SCREEN_WIDTH } from "~Constants"
import { VeBetterDaoActionGroup } from "../../Components/VeBetterDao/VeBetterDaoActionGroup"
import { useShareVeBetterCard } from "~Hooks/useShareVeBetterCard"
import { useIsVeBetterUser } from "~Hooks/useIsVeBetterUser"

type Props = {
    isEmptyStateShown?: boolean
}

export const Tokens = ({ isEmptyStateShown = false }: Props) => {
    const { cardRef, shareCard, isSharing } = useShareVeBetterCard()
    const { data: isVeBetterUser } = useIsVeBetterUser()

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

                    {isVeBetterUser && (
                        <>
                            <BaseSpacer height={40} />
                            <VeBetterDaoCard ref={cardRef} />
                            <VeBetterDaoActionGroup onShareCard={shareCard} isSharing={isSharing} />
                        </>
                    )}
                </>
            )}
        </BaseView>
    )
}
