import React, { memo } from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useGroupedStakingData } from "~Hooks/Staking"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { StakedCard } from "./StakedCard"

export const StakingSection = memo(() => {
    const { LL } = useI18nContext()
    const address = useAppSelector(selectSelectedAccountAddress)
    const { stakingGroups } = useGroupedStakingData(address)

    // Don't render if no staking data and not loading
    if (stakingGroups.length === 0) return null

    return (
        <BaseView>
            <BaseText py={10} typographyFont="bodySemiBold">
                {LL.ACTIVITY_STAKING_LABEL()}
            </BaseText>
            <BaseSpacer height={8} />
            <BaseView gap={8}>
                {stakingGroups.map(group => (
                    <BaseView key={`${group.address}-${group.isOwner}`}>
                        <StakedCard
                            nodes={group.nodes}
                            nfts={group.nfts}
                            isOwner={group.isOwner}
                            isLoading={group.isLoading}
                        />
                    </BaseView>
                ))}
            </BaseView>
        </BaseView>
    )
})
