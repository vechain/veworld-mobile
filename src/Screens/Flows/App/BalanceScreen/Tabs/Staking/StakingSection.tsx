import React from "react"
import { StargateCarousel } from "../../Components/Staking/StargateCarousel"
import { BaseSpacer } from "~Components"

export const StakingSection = () => {
    return (
        <>
            <StargateCarousel />
            <BaseSpacer height={40} />
        </>
    )
}
