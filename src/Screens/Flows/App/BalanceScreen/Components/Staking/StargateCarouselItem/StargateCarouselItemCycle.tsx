import moment from "moment"
import React, { useMemo } from "react"
import { useValidatorDetails } from "~Hooks/Staking/useValidatorDetails"
import { useI18nContext } from "~i18n"
import { BigNutils } from "~Utils"
import { StargateCarouselItemStats } from "./StargateCarouselItemStats"

export const StargateCarouselItemCycle = ({ validatorId }: { validatorId: string | null }) => {
    const { LL } = useI18nContext()

    const { data: validatorDetails } = useValidatorDetails({ validatorId: validatorId })

    const cyclePeriod = useMemo(() => {
        if (!validatorId) return "-"
        return LL.STARGATE_DAYS({
            days: Math.floor(
                moment
                    .duration(
                        BigNutils(validatorDetails?.cyclePeriodLength ?? "0")
                            .multiply(10)
                            .multiply(1000).toNumber,
                    )
                    .asDays(),
            ),
        })
    }, [LL, validatorDetails?.cyclePeriodLength, validatorId])

    return (
        <StargateCarouselItemStats.Simple
            label={LL.STARGATE_CYCLE_DURATION()}
            value={cyclePeriod}
            testID="STARGATE_CAROUSEL_ITEM_VALUE_CYCLE_DURATION"
        />
    )
}
