import React from "react"
import { VTHO } from "~Constants"
import { useStargateClaimableRewards } from "~Hooks/useStargateClaimableRewards"
import { useI18nContext } from "~i18n"
import { StargateCarouselItemStats } from "./StargateCarouselItemStats"

export const StargateCarouselItemClaimable = ({ nodeId }: { nodeId: string }) => {
    const { LL } = useI18nContext()
    const { data: claimableRewards } = useStargateClaimableRewards({ nodeId: nodeId })

    return (
        <StargateCarouselItemStats.Token
            label={LL.STARGATE_CLAIMABLE()}
            value={claimableRewards ?? "0"}
            icon={VTHO.icon}
            testID="STARGATE_CAROUSEL_ITEM_VALUE_CLAIMABLE"
        />
    )
}
