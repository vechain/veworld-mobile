import React from "react"
import { BaseSpacer, BaseView } from "~Components"
import { SCREEN_WIDTH } from "~Constants"
import { useIsVeBetterUser } from "~Hooks/useIsVeBetterUser"
import { useShareVeBetterCard } from "~Hooks/useShareVeBetterCard"
import { BannersCarousel } from "../../Components/BannerCarousel"
import { AddTokensCard } from "../../Components/Tokens/AddTokensCard"
import { VeBetterDaoActionGroup } from "../../Components/VeBetterDao/VeBetterDaoActionGroup"
import { VeBetterDaoCard } from "../../Components/VeBetterDao/VeBetterDaoCard"
import { BalanceActivity } from "../Activity/BalanceActivity"
import { TokensTopSection } from "./TokensTopSection"

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
                    {/* 36 because the activity above may have a See all button that has a padding of 4px.
                        Setting to 40 will look off compared to the card below when the banner is visible */}
                    <BannersCarousel location="home_screen" baseWidth={SCREEN_WIDTH - 48} padding={0} mt={36} />

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
