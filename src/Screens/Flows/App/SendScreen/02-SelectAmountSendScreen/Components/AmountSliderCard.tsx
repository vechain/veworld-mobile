import { DebouncedFunc } from "lodash"
import React from "react"
import { BaseCard, BaseRange, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    percentage: number
    throttleOnChangePercentage: DebouncedFunc<(value: number) => void>
}

export const AmountSliderCard = ({ percentage, throttleOnChangePercentage }: Props) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    return (
        <BaseCard>
            <BaseView flex={1}>
                <BaseText typographyFont="button">
                    {LL.SEND_BALANCE_PERCENTAGE({
                        percentage: `${percentage <= 100 ? percentage.toFixed(0) : "100"}%`,
                    })}
                </BaseText>
                <BaseView flexDirection="row">
                    <BaseText typographyFont="captionBold" color={theme.colors.primary}>
                        {LL.SEND_RANGE_ZERO()}
                    </BaseText>
                    <BaseSpacer width={8} />
                    <BaseRange value={percentage} onChange={throttleOnChangePercentage} />
                    <BaseSpacer width={8} />
                    <BaseText typographyFont="captionBold" color={theme.colors.primary}>
                        {LL.SEND_RANGE_MAX()}
                    </BaseText>
                </BaseView>
            </BaseView>
        </BaseCard>
    )
}
