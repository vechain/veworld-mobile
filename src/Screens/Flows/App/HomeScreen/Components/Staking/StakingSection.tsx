import React, { memo } from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useGroupedStakingData } from "~Hooks/Staking"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { StakedCard } from "./StakedCard"

export const StakingSection = memo(() => {
    const { LL } = useI18nContext()
    const address = useAppSelector(selectSelectedAccountAddress)
    const { stakingGroups, isLoading } = useGroupedStakingData(address)

    // Don't render if no staking data and not loading
    if (!isLoading && stakingGroups.length === 0) return null

    return (
        <BaseView>
            <BaseText py={10} typographyFont="bodySemiBold">
                {LL.ACTIVITY_STAKING_LABEL()}
            </BaseText>
            <BaseSpacer height={8} />
            {stakingGroups.map((group, index) => (
                <BaseView key={group.address}>
                    <StakedCard
                        nodes={group.nodes}
                        nfts={group.nfts}
                        isOwner={group.isOwner}
                        isLoading={group.isLoading}
                    />
                    {index < stakingGroups.length - 1 && <BaseSpacer height={12} />}
                </BaseView>
            ))}
        </BaseView>
    )
})
