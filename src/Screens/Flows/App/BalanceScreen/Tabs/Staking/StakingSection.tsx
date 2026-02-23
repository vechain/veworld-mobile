import React from "react"
import { StargateCarousel } from "../../Components/Staking/StargateCarousel"
import { BaseSpacer, BaseView } from "~Components"
import { BalanceActivity } from "../Activity/BalanceActivity"

export const StakingSection = () => {
    return (
        <BaseView px={24}>
            <StargateCarousel />
            <BaseSpacer height={32} />
            <BalanceActivity tab="STAKING" />
        </BaseView>
    )
}
