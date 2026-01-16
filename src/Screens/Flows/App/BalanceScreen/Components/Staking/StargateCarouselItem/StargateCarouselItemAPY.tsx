import React, { useMemo } from "react"
import { useFormatFiat } from "~Hooks"
import { useValidatorDetails } from "~Hooks/Staking/useValidatorDetails"
import { useI18nContext } from "~i18n"
import { formatDisplayNumber } from "~Utils/StandardizedFormatting"
import { StargateCarouselItemStats } from "./StargateCarouselItemStats"

export const StargateCarouselItemAPY = ({
    validatorId,
    levelName,
}: {
    validatorId: string | null
    levelName: string
}) => {
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()

    const { data: validatorDetails } = useValidatorDetails({ validatorId: validatorId })

    const apy = useMemo(() => {
        if (!validatorId) return "-"
        const yieldValue = (validatorDetails?.nftYieldsNextCycle?.[levelName] as number) ?? 0
        const displayValue = formatDisplayNumber(yieldValue, {
            forceDecimals: 1,
            includeSymbol: false,
            locale: formatLocale,
            skipThreshold: true,
        })
        return `${displayValue}%`
    }, [formatLocale, levelName, validatorDetails?.nftYieldsNextCycle, validatorId])

    return (
        <StargateCarouselItemStats.Simple
            label={LL.STARGATE_APY()}
            value={apy}
            testID="STARGATE_CAROUSEL_ITEM_VALUE_APY"
        />
    )
}
