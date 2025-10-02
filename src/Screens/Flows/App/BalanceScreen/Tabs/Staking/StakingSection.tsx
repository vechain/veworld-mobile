import React from "react"
import { StargateCarousel } from "../../Components/Staking/StargateCarousel"
import { BaseSpacer } from "~Components"
import { BalanceActivity } from "../Activity/BalanceActivity"

export const StakingSection = () => {
    return (
        <>
            <StargateCarousel />
            <BaseSpacer height={40} />
            <BalanceActivity tab="STAKING" />
        </>
    )
}
